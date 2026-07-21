---
slug: /deployment/kclm
title: Kubernetes Cluster Lifecycle Management (KCLM)
sidebar_position: 5
---

# Kubernetes Cluster Lifecycle Management (KCLM)

This guide covers the deployment of a Kubernetes Cluster Lifecycle Management (KCLM) solution to use metal-stack as a cloud provider. metal-stack supports three KCLM solutions:

## KCLM Solutions Overview

### Gardener

[Gardener](../../05-Concepts/04-Kubernetes/01-gardener.md) is the **recommended** KCLM solution for metal-stack. It is battle-tested in production for over seven years at financial-sector customers and bundles more day-2 capabilities natively (DNS, backup, audit). Gardener manages entire clusters as Kubernetes-native resources with a strong separation between platform operators and end-users.

:::tip
We recommend using a **dedicated cluster** for Gardener, separate from the metal-stack initial cluster. While it is technically possible to deploy both metal-stack and Gardener on the same initial cluster, dedicated clusters provide better isolation, clearer operational boundaries, and align with production best practices for critical infrastructure. For guidance on setting up the initial cluster, see the [Bootstrap Infrastructure](./02_bootstrap-infrastructure.md) documentation.
:::

For more details on Gardener terminology, architecture, operational model, failure domains, and operational features, see the [Gardener concept doc](../../05-Concepts/04-Kubernetes/01-gardener.md).

#### Deployment Summary

Gardener can be deployed with the `gardener-*` [Ansible roles](https://github.com/metal-stack/metal-roles/tree/master/control-plane/roles).

The following data center infrastructure dependencies are treated as given and must be available before deploying Gardener:

- **DNS** — For cluster domain resolution
- **NTP** — Time synchronization across all nodes
- **ACME** — Certificate authority (for shoot certificates via `shoot-cert-service`)
- **S3-compatible object storage** — For etcd backups with `gardener-extension-backup-s3`
- **Git-Hosting with CI/CD** — You must set up your own Git repository and CI/CD pipeline to manage cluster deployments (see [Fleet Management and GitOps](#fleet-management-and-gitops) below).

The following dependencies are introduced:

- CNI: Calico or Cilium
- MetalLB for exposing the Kubernetes API servers of the clusters

In summary, this results in the following cluster hierarchy:

- **Garden cluster** — The Gardener control plane (Gardener API server, controller manager, scheduler, admission controller) deployed on a dedicated cluster.
- **Seed** — A cluster running the `gardenlet` agent, connected to the Gardener control plane. Seeds are deployed inside the metal-stack partition and orchestrate cluster provisioning within that site.
- **Shoot** — Every fully provisioned and managed Kubernetes cluster. Shoot control planes run as pods in the Seed namespace, while worker nodes are provisioned as bare-metal machines on metal-stack infrastructure.

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
| `gardener-extension-networking-cilium` | Cilium CNI extension as an alternative to Calico                                                         |
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

#### Fleet Management and GitOps

You must set up your own Git repository and CI/CD pipeline to manage cluster deployments. This gives you peer review, audit trails, and rollback capabilities.

**What you need to build:**

1. **Git repository** — Store the following as YAML manifests:
   - `cloudprofiles/` — CloudProfile definitions (whitelisted regions, machine types, OS images, Kubernetes versions)
   - `seeds/` — Seed configurations per data center
   - `projects/<name>/shoots/` — Per-project Shoot manifests
   - `extensions/` — Helm charts for Gardener extensions
2. **CI/CD pipeline** — Deploy manifests from Git to the Gardener API (Virtual Garden). This pipeline is your primary interface for fleet-wide changes.
3. **Branching strategy** — Use separate branches or environments (staging → production) to validate changes before rolling them out fleet-wide.

**Operational capabilities provided by Gardener:**

Once your GitOps pipeline is in place, Gardener provides the following day-2 operational features:

- **CloudProfile validation** — Administrators define allowed regions, machine types, operating systems, and Kubernetes versions. Shoot specs are validated against the CloudProfile before being stored in the Virtual Garden's ETCD.
- **Multi-stage environments** — End-users can label clusters as `evaluation` or `development` to test upcoming Kubernetes versions and auto-upgrades before rolling them out to `production` clusters.
- **Maintenance time windows** — Configurable per Shoot; all day-2 operations (Kubernetes patch updates, machine image updates) are carried out within these windows.
- **Emergency patching** — Administrators can apply fleet-wide changes via image vector overwrites in the Gardener deployment Git repository. Changes must be validated in a dedicated staging environment first.
- **Accidental deletion protection** — Shoot deletion is guarded by specific annotations. ETCD backup retention timeouts are configurable, allowing cluster restoration after accidental deletion.

### Cluster-API

[Cluster-API](../../05-Concepts/04-Kubernetes/02-cluster-api.md) is a CNCF project maintained by a Kubernetes SIG that provides declarative cluster management through a management cluster. The metal-stack provider (CAPMS) is **under development** and not yet production-ready.

The [cluster-api-provider-metal-stack (CAPMS)](https://github.com/metal-stack/cluster-api-provider-metal-stack/) infrastructure provider translates CAPI resources into metal-stack API calls for machine, firewall, and IP allocation. CAPMS is tested against the Kubeadm Bootstrap Provider (CABPK) and uses the Add-on Provider for Helm (CAAPH) for installing CNIs like Calico and the metal-ccm.

:::warning
Cluster-API with metal-stack is in development and not advised for production use. Please use Gardener for production workloads. We are actively looking for exchange and adopters — if you are interested in using Cluster-API with metal-stack, please [join our community](/community) to help shape future integration efforts.
:::

For more details on Cluster-API concepts, architecture, operational model, and control plane hosting, see the [Cluster-API concept section](../../05-Concepts/04-Kubernetes/02-cluster-api.md).

Unlike Gardener, which provides a complete Kubernetes-as-a-Service platform with integrated day-2 operations (DNS, backup, certificate rotation, audit), Cluster-API is a declarative cluster management framework. Operators must assemble their own day-2 tooling — CNI, CCM, DNS, backup, and certificate management — and manage them through GitOps workflows.

#### Deployment

Cluster-API with metal-stack is deployed through the [cluster-api-provider-metal-stack (CAPMS)](https://github.com/metal-stack/cluster-api-provider-metal-stack/) infrastructure provider. The [CAPMS reference documentation](../../08-References/Kubernetes/cluster-api-provider-metal-stack/cluster-api-provider-metal-stack.md) covers the deployment in detail.

**Deployment flow**

1. **Prepare management cluster** — A Kubernetes cluster to host CAPI and CAPMS providers and cluster state
2. **Install CAPMS** — Deploy the CAPMS provider into the management cluster
3. **Configure `clusterctl`** — Register the metal-stack provider URL and set environment variables (API credentials, project, partition, machine images and sizes, cluster name, Kubernetes version)
4. **Generate and apply cluster manifest** — Use `clusterctl generate cluster` to produce a YAML with `Cluster`, `MetalStackCluster`, `KubeadmControlPlane`, `MachineDeployment`, and `MetalStackMachine` resources, then apply it
5. **Deploy add-ons** — Install CNI (Calico) and `metal-ccm` via `ClusterResourceSet` and CAAPH
6. **Retrieve kubeconfig** — Access the provisioned cluster

**Network integration**

Network integration for Cluster-API is currently more manual compared to Gardener. Node networks must be created manually via `metalctl` and provided as environment variables. IP addresses for the control plane also need to be allocated in advance through `metalctl`. Firewall rules are currently static and can be applied to firewall nodes; no automatic firewall controller is in place yet. Automatic network resource allocation is on the roadmap for CAPMS.

For service exposure, CAPMS uses KubeVIP in BGP mode to allocate and announce public IPs, similar to the MetalLB-based approach in Gardener.

**Air-gapped environments**

For air-gapped deployments, follow the [Cluster API Operator air-gapped environment guide](https://cluster-api-operator.sigs.k8s.io/topics/configuration/air-gapped-environtment). All required images must be mirrored to an OCI registry reachable from the management cluster.

**Fleet management and GitOps**

You must set up your own Git repository and GitOps operator to manage cluster deployments.

**What you need to build:**

1. **Git repository** — Store cluster manifests generated via `clusterctl generate cluster <cluster-name>`. Each cluster gets its own set of YAML files containing `Cluster`, `MetalStackCluster`, `KubeadmControlPlane`, `MachineDeployment`, and `MetalStackMachine` resources.
2. **GitOps operator** — Deploy ArgoCD or FluxCD to watch your Git repository and apply manifests to the management cluster, ensuring drift-free declarative delivery.
3. **Per-cluster CI/CD** — Essential components (CNI, CCM) are rolled out on a per-cluster basis. Changes to `MachineTemplate` or `ClusterResourceSet` are staged through the Git repository with standard approval processes.

**Platform capabilities:**

- **Cluster migration** — `clusterctl move` enables moving workload cluster resources between management clusters, pausing controllers during the move to prevent worker node loss.

### Kamaji

[Kamaji](https://kamaji.clastix.io/) is a Control Plane Manager for Kubernetes that runs control planes as pods within a management cluster, reducing operational overhead and costs. It supports multi-tenancy, high availability, and integrates with Cluster API as a `ControlPlaneProvider`.

Kamaji allows a similar control plane hosting model as Gardener, where the control plane runs on dedicated infrastructure separate from worker nodes.

:::warning
Kamaji integrations with metal-stack have not been evaluated in production-grade scenarios. We are actively looking for exchange and adopters — if you are interested in using Kamaji with metal-stack, please [join our community](/community) to help shape future integration efforts.
:::

#### Kamaji with metal-stack

Kamaji acts as a `ControlPlaneProvider` with Cluster API, while CAPMS acts as the `InfrastructureProvider`. This setup manages **tenant clusters** on metal-stack infrastructure, combining Kamaji's control plane management with metal-stack's bare-metal provisioning.

Like Cluster-API, Kamaji is a framework rather than a complete platform — operators must assemble their own day-2 tooling (CNI, CCM, DNS, backup, certificate management) and manage them through GitOps workflows.

**Deployment**

1. **Prepare management cluster** — A Kubernetes cluster to host Kamaji and CAPMS providers
2. **Install Kamaji and CAPMS** — Deploy both providers into the management cluster
3. **Create a control plane VIP** — MetalLB assigns a virtual IP for the tenant API server
4. **Generate and apply tenant cluster manifest** — Use `clusterctl generate cluster` to produce a YAML with `Cluster`, `MetalStackCluster`, `KubeadmControlPlane`, `MachineDeployment`, and `MetalStackMachine` resources, then apply it
5. **Deploy add-ons** — Install CNI (Calico) and `metal-ccm` into the tenant cluster

A working showcase is available in the [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/blob/main/DEVELOPMENT.md#running-the-kamaji-flavor) setup, which extends the `mini-lab` with a Kamaji flavor. See our [blog post](/blog/2026/04-kamaji) for a detailed walkthrough of the architecture and setup.

**Fleet management and GitOps**

Since Kamaji with metal-stack uses Cluster-API under the hood, fleet management follows the same pattern as Cluster-API. Tenant cluster manifests are generated via `clusterctl`, stored in Git, and deployed through your CI/CD pipeline.
