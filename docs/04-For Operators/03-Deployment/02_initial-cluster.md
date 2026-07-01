---
slug: /deployment/initial-cluster
title: Initial Cluster
sidebar_position: 2
---

# Initial Cluster

Before creating the `Garden cluster`, a base Kubernetes cluster needs to be in place. This initial cluster serves as the bootstrap infrastructure, where both the metal-stack control plane and Gardener are deployed.

## Suggestions for the Initial Cluster

The initial cluster can be hosted anywhere — a hyperscaler, metalstack.cloud, or a self-hosted solution. Some common options:

- **metalstack.cloud** — A Kubernetes cluster can be created via [UI](https://metalstack.cloud/de/documentation/UserManual#creating-a-cluster), CLI, or Terraform.
- **GCP/GKE** — A GCP account is required. The Ansible [gcp-auth role](https://github.com/metal-stack/ansible-common/tree/master/roles/gcp-auth) can be used for authentication, and the [gcp-create role](https://github.com/metal-stack/ansible-common/tree/master/roles/gcp-create) for creating a GKE cluster.
  - Suggested defaults: `gcp_machine_type`: e2-standard-8, `gcp_autoscaling_min_nodes`: 1, `gcp_autoscaling_max_nodes`: 3

## Next Steps

Once the initial cluster is in place, the deployment continues with:

1. **[Metal Control Plane Deploymen](./03_control-plane.mdx)** — Deploy the metal-stack control plane into the initial cluster.
2. **[Partition Deployment](./04_partition.md)** — Set up a partition
3. **[Gardener Setup](./05_gardener.md)** — Configure Gardener to use metal-stack as a provider.
