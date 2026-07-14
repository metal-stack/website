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

## KCLM Solutions

metal-stack supports three Kubernetes Cluster Lifecycle Management solutions, each with different maturity levels and capabilities.
See the [Kubernetes Concepts Section](../../05-Concepts/04-Kubernetes/01-gardener.md) for a detailed comparison.

### Gardener

[Gardener](../../05-Concepts/04-Kubernetes/01-gardener.md) is the **recommended** path for Kubernetes cluster lifecycle management. It is battle-tested in production for over seven years at financial-sector customers and bundles several day-2 capabilities natively (DNS, backup, audit). Gardener manages entire clusters as Kubernetes-native resources with a strong separation between platform operators and end-users.

:::tip
Gardener is the recommended solution for production environments. See the [Gardener concept section](../../05-Concepts/04-Kubernetes/01-gardener.md) for terminology and architecture details.
:::

### Cluster-API

[Cluster-API](../../05-Concepts/04-Kubernetes/02-cluster-api.md) is a CNCF project maintained by a Kubernetes SIG that provides declarative cluster management through a management cluster. The metal-stack provider (CAPMS) is **under development** and not yet production-ready.

:::warning
Cluster-API with metal-stack is in development and not advised for production use. Please use Gardener for production workloads.
:::

#### Kamaji

[Kamaji](../../05-Concepts/04-Kubernetes/02-cluster-api.md#kamaji) allows a similar control plane hosting model as Gardener, where the control plane runs on dedicated infrastructure separate from worker nodes.
Kamaji therefore uses ClusterAPI to support different infrastructure- and control-plane providers.
However, Kamaji integrations with metal-stack **have not been evaluated in production-grade scenarios** by metal-stack.

:::warning
Kamaji with metal-stack is in development and not advised for production use. Please use Gardener for production workloads.
:::

## Deployment Options

There are three supported approaches for hosting the initial cluster:

### Option 1: Shared Initial Cluster

It is possible to use a **single initial cluster** for both metal-stack and the KCLM solution. This approach is technically feasible but **not recommended** for production environments. Sharing a single cluster mixes platform infrastructure with lifecycle management, which can complicate operational boundaries and failure isolation.

### Option 2: Dedicated Initial Clusters

We recommend using **dedicated initial clusters** for metal-stack and the KCLM solution — one cluster for the metal-stack control plane and a separate cluster for the KCLM.

This approach provides clearer operational boundaries, better isolation and simplified failure boundaries.

### Option 3: Autonomous Control Plane

For self-hosted deployments, metal-stack can be set up with an [Autonomous Control Plane](/community/MEP-18-autonomous-control-plane) cluster. This approach is the best choice for organizations that require full digital sovereignty and autonomy over their entire infrastructure stack.

The autonomous control-plane cluster serves as a minimal control plane whose sole purpose is to host the production control plane cluster (the "Matryoshka principle").
This brings several advantages like failure isolation, separate operational responsibility, minimal resource requirements and full control and ownership.

The only requirement from metal-stack is that your partitions can establish network connections to the metal control-plane.

## Suggestions for the Initial Cluster

### For Options 1 & 2: Cloud-Hosted Clusters

For the shared and dedicated cluster approaches, the initial cluster can be hosted anywhere — a hyperscaler, metalstack.cloud, or any other managed Kubernetes provider. Some common options:

- **metalstack.cloud** — A Kubernetes cluster can be created via [UI](https://metalstack.cloud/de/documentation/UserManual#creating-a-cluster), CLI, or [Terraform](https://github.com/metal-stack-cloud/terraform-provider-metal).
- **GCP/GKE** — A GCP account is required. The Ansible [gcp-auth role](https://github.com/metal-stack/ansible-common/tree/master/roles/gcp-auth) can be used for authentication, and the [gcp-create role](https://github.com/metal-stack/ansible-common/tree/master/roles/gcp-create) for creating a GKE cluster.
  - Suggested defaults: `gcp_machine_type`: e2-standard-8, `gcp_autoscaling_min_nodes`: 1, `gcp_autoscaling_max_nodes`: 3

### For Option 3: Autonomous Control Plane with k3s

For the autonomous control plane approach, [MEP-18](/community/MEP-18-autonomous-control-plane) proposes using [k3s](https://k3s.io/) as the initial cluster. This is because KCLM solutions are not yet able to create an initial cluster themselves (though this may change with implementations like [GEP-28](https://github.com/gardener/enhancements/blob/main/geps/0028-self-hosted-shoot-clusters/README.md) for Gardener).

The k3s nodes can be either bare metal machines or virtual machines. For a minimal setup, a single node with 8–16 cores, 64GB RAM, and two NVMe drives of 1TB is a good starting point. For high availability, a clustered k3s configuration across multiple nodes is recommended, with ETCD replication and backup-restore mechanisms configured for metal-stack and KCLM components.

See the [Autonomous Control Plane](/community/MEP-18-autonomous-control-plane) proposal for detailed architecture, failure scenarios, and implementation guidance.
