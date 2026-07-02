---
slug: /deployment/kclm
title: Kubernetes Cluster Lifecycle Management (KCLM)
sidebar_position: 5
---

# Kubernetes Cluster Lifecycle Management (KCLM)

This guide covers the deployment of a Kubernetes Cluster Lifecycle Management (KCLM) solution to use metal-stack as a cloud provider. metal-stack supports three KCLM solutions:

## KCLM Solutions Overview

### Gardener (Recommended)

[Gardener](../../05-Concepts/04-Kubernetes/01-gardener.md) is the **recommended** KCLM solution for metal-stack. It is battle-tested in production for over seven years at financial-sector customers and bundles more day-2 capabilities natively (DNS, backup, audit). Gardener manages entire clusters as Kubernetes-native resources with a strong separation between platform operators and end-users.

:::tip
We recommend using a **dedicated cluster** for Gardener, separate from the metal-stack initial cluster. While it is technically possible to deploy both metal-stack and Gardener on the same initial cluster, dedicated clusters provide better isolation, clearer operational boundaries, and align with production best practices for critical infrastructure. For guidance on setting up the initial cluster, see the [Initial Cluster](./02_initial-cluster.md) documentation.
:::

For more details on Gardener terminology, architecture, operational model, failure domains, and operational features, see the [Gardener concept doc](../../05-Concepts/04-Kubernetes/01-gardener.md).

#### Deployment Summary

Gardener can be deployed with the `gardener-*` [Ansible roles](https://github.com/metal-stack/metal-roles/tree/master/control-plane/roles).

The following data center infrastructure dependencies are treated as given and must be available before deploying Gardener:

- **DNS** — For cluster domain resolution
- **NTP** — Time synchronization across all nodes
- **ACME** — Certificate authority (for shoot certificates via shoot-cert-service)
- **S3-compatible object storage** — For etcd backups (gardener-extension-backup-s3)
- **Git-Hosting with CI/CD** — For GitOps-driven deployment of manifests

The following dependencies are introduced:

- CNI: Calico or Cilium
- MetalLB for exposing the Kubernetes API servers of the clusters

In summary, this results in the following:

- `Garden cluster` created in the Gardener cluster (dedicated cluster)
- `soil cluster` created in the Gardener cluster. This will be the `initial seed` used for spinning up `shooted seeds` in the metal-stack partition
- `shooted seed` inside the metal-stack partition, where all `shoots` are derived from

:::tip
We are officially supported by [Gardener dashboard](https://github.com/gardener/dashboard). The dashboard helps you manage Shoots, Seeds, and Projects through a web UI.
:::

#### Core Controllers

The Gardener platform consists of the following core controllers, all deployed via the Ansible roles:

| Component                                   | Responsibility                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `gardener-operator`                         | Deploys Gardener components, gardenlets, and extensions; manages platform updates        |
| `gardener-apiserver`                        | Extends the kube-apiserver with Gardener-specific resources (Shoot, Seed, Project, etc.) |
| `gardener-scheduler`                        | Decides where clusters are placed across the Gardener landscape (Seeds)                  |
| `gardener-controller-manager`               | Reconciles common Gardener resources (projects, controller installations, etc.)          |
| `gardenlet`                                 | Agent running on each Seed; orchestrates provisioning of new clusters within that Seed   |
| `gardener-resource-manager`                 | Runs inside Shoots; reconciles desired resources and checks their health                 |
| `etcd-druid`                                | etcd cluster operator with built-in backup-restore functionality                         |
| `machine-controller-manager`                | Manages worker node lifecycle (rolling updates, health recreation, scaling)              |
| `machine-controller-manager-provider-metal` | Integrates metal-stack machine provisioning API with Gardener's MCM                      |

#### Gardener Extensions

Gardener's extensibility model allows provider-specific reconcilers to be deployed during cluster provisioning. The `gardener-extensions` [Ansible role](https://github.com/metal-stack/metal-roles/tree/master/control-plane/roles/gardener-extensions) deploys the following extensions into the Gardener runtime cluster:

| Extension                              | Purpose                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `gardener-extension-provider-metal`    | IaaS integration — reconciles Infrastructure, ControlPlane, and Worker resources via the metal-stack API |
| `os-metal-extension`                   | Translates Gardener's generic `OperatingSystemConfig` into cloud-init/ignition userdata                  |
| `gardener-extension-networking-calico` | Calico CNI extension                                                                                     |
| `gardener-extension-networking-cilium` | Cilium CNI extension (alternative to Calico)                                                             |
| `gardener-extension-dns-powerdns`      | DNS management via PowerDNS                                                                              |
| `shoot-dns-service`                    | DNS service for Shoot clusters                                                                           |
| `gardener-extension-backup-s3`         | etcd backup to S3-compatible object storage                                                              |
| `gardener-extension-audit`             | Audit logging webhook                                                                                    |
| `gardener-extension-acl`               | Access control list management                                                                           |
| `shoot-cert-service`                   | Certificate management with Let's Encrypt (supports Shoot-level issuers)                                 |
| `gardener-extension-csi-driver-lvm`    | LVM-based CSI driver for local storage                                                                   |
| `gardener-extension-ontap`             | NetApp ONTAP CSI driver                                                                                  |

Most extensions are enabled/disabled via Ansible variables (e.g., `gardener_extension_provider_metal_enabled`). Key configuration variables for the metal provider include:

- `gardener_extension_provider_metal_etcd_storage_class_name` — Storage class for Shoot etcds
- `gardener_extension_provider_metal_etcd_backup_schedule` — etcd backup schedule
- `gardener_extension_provider_metal_machine_images` — Machine images (typically matches CloudProfile)
- `gardener_extension_provider_metal_admission_default_pods_cidr` — Default pod CIDR for Shoots
- `gardener_extension_provider_metal_admission_default_services_cidr` — Default services CIDR for Shoots

For the full variable reference, see the [gardener-extensions README](https://github.com/metal-stack/metal-roles/tree/master/control-plane/roles/gardener-extensions).

### Cluster-API (Alternative)

[Cluster-API](../../05-Concepts/04-Kubernetes/02-cluster-api.md) is a CNCF project maintained by a Kubernetes SIG that provides declarative cluster management through a management cluster. The metal-stack provider (CAPMS) is **under heavy development** and not yet production-ready.

The [cluster-api-provider-metal-stack (CAPMS)](https://github.com/metal-stack/cluster-api-provider-metal-stack/) infrastructure provider translates CAPI resources into metal-stack API calls for machine, firewall, and IP allocation. CAPMS is tested against the Kubeadm Bootstrap Provider (CABPK) and uses the Add-on Provider for Helm (CAAPH) for installing CNIs like Calico and the metal-ccm.

:::warning
Cluster-API with metal-stack is in early development and not advised for production use. Please use Gardener for production workloads.
:::

For more details on Cluster-API concepts, architecture, operational model, and control plane hosting, see the [Cluster-API concept doc](../../05-Concepts/04-Kubernetes/02-cluster-api.md).

### Kamaji (Alternative)

[Kamaji](https://kamaji.clastix.io/) is a Control Plane Manager for Kubernetes that runs control planes as pods within a management cluster, cutting down on operational overhead and costs. It supports multi-tenancy, high availability, and integrates seamlessly with Cluster API.

Kamaji allows a similar control plane hosting model as Gardener, where the control plane runs on dedicated infrastructure separate from worker nodes. However, Kamaji integrations with metal-stack **have not been evaluated in production-grade scenarios** by metal-stack.

#### Kamaji with metal-stack

Kamaji can be used as a `ControlPlaneProvider` with Cluster API, while CAPMS acts as the `InfrastructureProvider`. This setup allows Kamaji to manage **tenant clusters** on metal-stack infrastructure:

- Kamaji runs as pods in a management cluster (e.g., a `kind` cluster)
- CAPMS provisions worker nodes and firewall resources on metal-stack via the metal-stack API
- Tenant cluster control planes run as pods in the management cluster
- Worker nodes join via CABPK and kubeadm
- `metal-ccm` needs to be deployed into tenant clusters for load balancer and node management

A working showcase is available in the [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab) setup, which extends the `mini-lab` with a Kamaji flavor. See our [blog post](/blog/2026/04-kamaji) for a detailed walkthrough of the architecture and setup.

:::tip
If you are interested in using Kamaji with metal-stack, please reach out to the metal-stack team to discuss your requirements and help shape future integration efforts.
:::
