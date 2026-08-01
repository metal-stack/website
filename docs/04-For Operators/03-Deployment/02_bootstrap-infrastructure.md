---
slug: /deployment/bootstrap-infrastructure
title: Bootstrap Infrastructure
sidebar_position: 2
---

# Bootstrap Infrastructure

Every metal-stack deployment starts with one or more **initial clusters** — Kubernetes clusters that host the [metal control-plane](../../05-Concepts/01-architecture.mdx#metal-control-plane). Collectively, these form the **bootstrap infrastructure** for your metal-stack platform.

The initial cluster(s) serve two purposes:

1. **Host the metal-stack control plane** — the core platform components for bare-metal management.
2. **Enable Kubernetes Cluster Lifecycle Management (KCLM)** — if you need to provision and manage downstream Kubernetes clusters on your bare-metal machines.

The number and placement of initial clusters depends on your KCLM choice, availability requirements, and autonomy needs.

If you only need **Bare-Metal as a Service** without KCLM, you need at least **one initial cluster** for the [Control Plane](./03_control-plane.mdx).

:::tip
Your control plane Kubernetes cluster can run anywhere — on a hyperscaler, in your own data center, or on [metalstack.cloud](https://metalstack.cloud). A managed cluster removes the operational burden of running Kubernetes yourself and can even strengthen fail-safe operation. Learn more about the [rationale for this approach](../../05-Concepts/01-architecture.mdx#target-deployment-platforms) and find concrete hosting suggestions below.
:::

## Requirements for the Initial Cluster

Whichever hosting option you pick, the initial cluster has to satisfy three properties:

- **Reachable from the partitions** — Every partition must reach the metal-api over HTTPS as well as gRPC (`50051`), NSQ (`4150`) and metal-console (`5222`). These layer-4 services need explicit exposure; see [Control Plane](./03_control-plane.mdx).
- **Persistent storage** — The control plane databases hold your masterdata and IP address management. Provide a storage class with persistent volumes and enable the [backup-restore-sidecar](./03_control-plane.mdx#setting-up-the-backup-restore-sidecar).
- **Independent lifecycle** — The initial cluster must not run on the machines that metal-stack manages, otherwise you create a circular dependency you cannot recover from.

## Choosing a KCLM Solution

metal-stack integrates with two Kubernetes Cluster Lifecycle Management solutions — Gardener and Cluster API (the latter optionally combined with Kamaji as control-plane provider). They differ substantially in maturity, day-2 capabilities and operational model.

The [KCLM concepts chapter](../../05-Concepts/04-Kubernetes/01-kclm.md#two-approaches-one-infrastructure) contains the full comparison and decision matrix. The short version:

| Solution                                                                                          | Status                                                     | Guide                                                                          |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [Gardener](../../05-Concepts/04-Kubernetes/02-gardener.md)                                        | **Recommended**, production-proven for 7+ years            | [Gardener deployment](./05_gardener.md)                                        |
| [Cluster API (CAPMS)](../../05-Concepts/04-Kubernetes/03-cluster-api.md)                          | Beta, under active development                             | [Cluster API deployment](./06_cluster-api.md)                                  |
| [Cluster API + Kamaji](../../05-Concepts/04-Kubernetes/03-cluster-api.md#kamaji-with-metal-stack) | Not evaluated in production-grade scenarios by metal-stack | [Cluster API deployment](./06_cluster-api.md#kamaji-as-control-plane-provider) |

:::warning
Only Gardener is recommended for production workloads today. Cluster API with metal-stack is in beta, and the Kamaji integration has not been evaluated in production-grade scenarios by metal-stack. Your KCLM choice determines the required cluster topology described below, so make it before you deploy anything.
:::

## Deployment Options

There are three approaches for hosting the initial cluster. All three are viable; they trade operational simplicity against autonomy.

|                     | Option 1: Shared            | Option 2: Dedicated             | Option 3: Autonomous     |
| ------------------- | --------------------------- | ------------------------------- | ------------------------ |
| Clusters            | 1                           | 2                               | 2 (nested)               |
| Operational effort  | Lowest                      | Low                             | Highest                  |
| Failure isolation   | Weak                        | Good                            | Good                     |
| Digital sovereignty | Depends on provider         | Depends on provider             | Full                     |
| Recommended for     | Evaluation, small platforms | **Most production deployments** | Sovereignty requirements |

### Option 1: Shared Initial Cluster

It is possible to use a **single initial cluster** for both metal-stack and the KCLM solution. This approach is technically feasible but **not recommended** for production environments. Sharing a single cluster mixes platform infrastructure with lifecycle management, which complicates operational boundaries and failure isolation — a Gardener upgrade and a metal-api upgrade then share one blast radius.

### Option 2: Dedicated Initial Clusters

We recommend using **dedicated initial clusters** for metal-stack and the KCLM solution — one cluster for the metal-stack control plane and a separate cluster for the KCLM.

This approach provides clearer operational boundaries, better isolation and simplified failure boundaries. In Gardener terminology the second cluster becomes the _runtime cluster_ (and typically the first Seed, the "soil"); see the [Gardener deployment guide](./05_gardener.md#architecture-overview).

### Option 3: Autonomous Control Plane

For self-hosted deployments, metal-stack can be set up with an [Autonomous Control Plane](/community/MEP-18-autonomous-control-plane) cluster. This approach is the best choice for organizations that require full digital sovereignty and autonomy over their entire infrastructure stack.

The autonomous control-plane cluster serves as a minimal cluster whose sole purpose is to host the production control plane cluster (the "Matryoshka principle").
This brings several advantages like failure isolation, separate operational responsibility, minimal resource requirements and full control and ownership.

The only requirement from metal-stack is that your partitions can establish network connections to the metal control-plane.

## Suggestions for the Initial Cluster

### For Options 1 & 2: Cloud-Hosted Clusters

For the shared and dedicated cluster approaches, the initial cluster can be hosted anywhere — a hyperscaler, metalstack.cloud, or any other managed Kubernetes provider. Some common options:

- **metalstack.cloud** — A Kubernetes cluster can be created via [UI](https://metalstack.cloud/de/documentation/UserManual#creating-a-cluster), CLI, or [Terraform](https://github.com/metal-stack-cloud/terraform-provider-metal).
- **GCP/GKE** — A GCP account is required. The Ansible [gcp-auth role](https://github.com/metal-stack/ansible-common/tree/master/roles/gcp-auth) can be used for authentication, and the [gcp-create role](https://github.com/metal-stack/ansible-common/tree/master/roles/gcp-create) for creating a GKE cluster. Use `metal_control_plane_host_provider: gcp` in this case.
  - Suggested defaults: `gcp_machine_type`: `e2-standard-8`, `gcp_autoscaling_min_nodes`: 1, `gcp_autoscaling_max_nodes`: 3

:::info
`metal_control_plane_host_provider` is only evaluated by the Gardener roles, which use it to discover the runtime cluster's node, pod and service CIDRs. It is asserted to be either `metal` or `gcp`. Any other Kubernetes distribution works as well, but you then have to provide the `kube-system/shoot-info` ConfigMap yourself — see the [Gardener prerequisites](./05_gardener.md#prerequisites).
:::

### For Option 3: Autonomous Control Plane with k3s

For the autonomous control plane approach, [MEP-18](/community/MEP-18-autonomous-control-plane) proposes using [k3s](https://k3s.io/) as the initial cluster. This is because KCLM solutions are not yet able to create an initial cluster themselves (though this may change with implementations like [GEP-28](https://github.com/gardener/enhancements/blob/main/geps/0028-self-hosted-shoot-clusters/README.md) for Gardener).

The k3s nodes can be either bare metal machines or virtual machines. For a minimal setup, a single node with 8–16 cores, 64 GB RAM, and two NVMe drives of 1 TB is a good starting point. For high availability, a clustered k3s configuration across multiple nodes is recommended, with etcd replication and backup-restore mechanisms configured for metal-stack and KCLM components.

See the [Autonomous Control Plane](/community/MEP-18-autonomous-control-plane) proposal for detailed architecture, failure scenarios, and implementation guidance.
