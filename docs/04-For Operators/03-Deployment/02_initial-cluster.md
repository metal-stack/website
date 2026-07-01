---
slug: /deployment/initial-cluster
title: Initial Cluster
sidebar_position: 2
---

# Initial Cluster

Before creating the `Garden cluster`, a base Kubernetes cluster needs to be in place. This initial cluster serves as the bootstrap infrastructure for the **metal-stack control plane**.

## Deployment Options

There are three supported approaches for hosting the initial cluster:

### Option 1: Shared Initial Cluster

It is possible to use a **single initial cluster** for both metal-stack and Gardener. This approach is technically feasible but **not recommended** for production environments. Sharing a single cluster mixes platform infrastructure with lifecycle management, which can complicate operational boundaries and failure isolation.

### Option 2: Dedicated Clusters

We recommend using **dedicated (initial) clusters** for metal-stack and Gardener — one cluster for the metal-stack control plane and a separate cluster for Gardener. This approach provides:

- **Clearer operational boundaries** — Separation of platform administrators and Gardener operators aligns with the role model described in the [Kubernetes Cluster Lifecycle Management](/Kubernetes%20Cluster%20Lifecycle%20Management) documentation
- **Better isolation** — Physical separation of control planes follows best practices for critical infrastructure, where operator-managed control plane components are inaccessible to end-users
- **Simplified failure boundaries** — Outages of the Gardener cluster only affect cluster provisioning, not the metal-stack infrastructure or existing workloads

### Option 3: Autonomous Control Plane (Best for Digital Sovereignty and Critical Infrastructure)

For self-hosted deployments, metal-stack can be set up with an [Autonomous Control Plane](/community/MEP-18-autonomous-control-plane) cluster. This approach is the best choice for organizations that require full digital sovereignty and autonomy over their entire infrastructure stack. The only requirement from metal-stack is that your partitions can establish network connections to the metal control plane.

## Suggestions for the Initial Cluster

### For Options 1 & 2: Cloud-Hosted Clusters

For the shared and dedicated cluster approaches, the initial cluster can be hosted anywhere — a hyperscaler, metalstack.cloud, or any other managed Kubernetes provider. Some common options:

- **metalstack.cloud** — A Kubernetes cluster can be created via [UI](https://metalstack.cloud/de/documentation/UserManual#creating-a-cluster), CLI, or Terraform.
- **GCP/GKE** — A GCP account is required. The Ansible [gcp-auth role](https://github.com/metal-stack/ansible-common/tree/master/roles/gcp-auth) can be used for authentication, and the [gcp-create role](https://github.com/metal-stack/ansible-common/tree/master/roles/gcp-create) for creating a GKE cluster.
  - Suggested defaults: `gcp_machine_type`: e2-standard-8, `gcp_autoscaling_min_nodes`: 1, `gcp_autoscaling_max_nodes`: 3

:::tip
For metal-stack it does not matter where your control plane Kubernetes cluster is located. You can of course use a cluster managed by a hyperscaler. This has the advantage of not having to setup Kubernetes by yourself and could even become beneficial in terms of fail-safe operation. If you are interested, you can find a reasoning behind this deployment decision [here](../../05-Concepts/01-architecture.mdx#target-deployment-platforms).
:::

### For Option 3: Autonomous Control Plane with k3s

For the autonomous control plane approach, [MEP-18](/community/MEP-18-autonomous-control-plane) proposes using [k3s](https://k3s.io/) as the initial cluster. This is because Gardener is not yet able to create an initial cluster itself (though this may change with the implementation of [GEP-28](https://github.com/gardener/gardener/blob/master/docs/proposals/28-autonomous-shoot-clusters.md)).

The k3s cluster serves as a minimal control plane whose sole purpose is to host the production control plane cluster (the "Matryoshka principle"). This brings several advantages:

- **Failure isolation** — In the event of an interruption or loss of the initial k3s cluster, the production control plane remains unaffected, and end users can continue to manage their clusters as normal.
- **Separate operational responsibility** — A dedicated operations team can take care of the Day-2 maintenance of the k3s installation, which uses different tools than the rest of the setup.
- **Minimal resource requirements** — Since the number of shoot clusters to host is static, resource requirements are minimal and stable over time.

The k3s nodes can be either bare metal machines or virtual machines. For a minimal setup, a single node with 8–16 cores, 64GB RAM, and two NVMe drives of 1TB is a good starting point. For high availability, a clustered k3s configuration across multiple nodes is recommended, with ETCD replication and backup-restore mechanisms configured for metal-stack and Gardener components.

See the [Autonomous Control Plane](/community/MEP-18-autonomous-control-plane) proposal for detailed architecture, failure scenarios, and implementation guidance.

## Next Steps

Once the initial cluster is in place, the deployment continues with:

1. **[Metal Control Plane Deployment](./03_control-plane.mdx)** — Deploy the metal-stack control plane into the initial cluster.
2. **[Partition Deployment](./04_partition.md)** — Set up a partition
3. **[Gardener Setup](./05_gardener.md)** — Configure Gardener on its own dedicated cluster to use metal-stack as a provider.
