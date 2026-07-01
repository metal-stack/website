---
slug: /deployment/kclm
title: Kubernetes Cluster Lifecycle Management (KCLM)
sidebar_position: 5
---

# Kubernetes Cluster Lifecycle Management (KCLM)

This guide sets up a Kubernetes Cluster Lifecycle Management (KCLM) solution to use metal-stack as a cloud provider. metal-stack supports three KCLM solutions:

## KCLM Solutions Overview

### Gardener (Recommended)

[Gardener](../../05-Concepts/04-Kubernetes/01-gardener.md) is the **recommended** KCLM solution for metal-stack. It is battle-tested in production for over seven years at financial-sector customers and bundles more day-2 capabilities natively (DNS, backup, audit). Gardener manages entire clusters as Kubernetes-native resources with a strong separation between platform operators and end-users.

:::tip
We recommend using a **dedicated cluster** for Gardener, separate from the metal-stack initial cluster. While it is technically possible to deploy both metal-stack and Gardener on the same initial cluster, dedicated clusters provide better isolation, clearer operational boundaries, and align with production best practices for critical infrastructure.
:::

#### Cluster Architecture

Gardener uses a hierarchical cluster model — often called the "kubeception" model — where Kubernetes clusters host other Kubernetes clusters:

- **Garden cluster** — The top-level cluster that runs the Gardener control plane (API server, controller manager, scheduler, admission controller). It is recommended to deploy via the `gardener-operator`.
- **Virtual Garden** — A recommended deployment pattern where Gardener runs inside a virtual cluster on the Garden cluster. This provides a dedicated ETCD for Gardener resources and an independent update lifecycle from the Garden cluster itself. End users get project namespaces in the virtual garden.
- **Seed cluster** — A cluster where a `gardenlet` agent runs. The gardenlet connects to the Gardener control plane and orchestrates provisioning of new clusters within that Seed. Typically one Seed per data-center site. A Seed that has been manually deployed (not by Gardener) is called a **soil**.
- **Shoot cluster** — Every fully provisioned and managed Kubernetes cluster. The Shoot's control plane (kube-apiserver, etcd, controller-manager, scheduler) runs as pods in a dedicated namespace on a Seed, while worker nodes run on bare-metal machines provisioned via the metal-stack API. This is "Kubernetes-in-Kubernetes" — the Shoot control plane is physically separated from end-user workloads.

The cluster hierarchy looks like this:

```
Garden Cluster (Gardener control plane)
├── Virtual Garden (dedicated ETCD for Gardener resources)
│   ├── Seed 1 (gardenlet + extensions)
│   │   ├── Shoot A (control plane on Seed 1, workers on metal-stack)
│   │   └── Shoot B
│   └── Seed 2 (gardenlet + extensions)
│       └── Shoot C
└── Soil cluster (manually deployed, can become a Seed via ManagedSeed)
```

#### Operational Model

Gardener differentiates between **end-users** (shoot owners) and **platform administrators** (seed owners), similar to how hyperscalers offer Kubernetes as a Service:

| Role               | Responsibilities                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **End-Users**      | Create/manage clusters via API (limited to whitelisted machine types), manage worker groups, trigger cluster updates, configure maintenance windows and auto-updates     |
| **Administrators** | Set up Seed clusters in data centers, whitelist machine types, provide Kubernetes versions and OS images, define lifecycle policies, fleet-wide GitOps-driven operations |

End-users access the Virtual Garden through a feature-rich Kubernetes API with OIDC-based authorization. Platform administrators manage the entire platform through GitOps-driven processes with approval workflows. Gardener clearly defines responsibility boundaries — administrators manage the control plane lifecycle, CNI, CSI drivers, and other platform components, while end-users focus on their workloads.

#### Deployment Summary

Gardener can be deployed with the `gardener-*` [Ansible roles](https://github.com/metal-stack/metal-roles/tree/master/control-plane/roles).

The roles deploy the following components:

- virtual garden
- Gardener control plane components
- soil cluster
- managed seed cluster (into the metal-stack partition)

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

#### External Dependencies

The following data center infrastructure dependencies are treated as given and must be available before deploying Gardener:

- **DNS** — For cluster domain resolution (PowerDNS or external)
- **NTP** — Time synchronization across all nodes
- **ACME** — Certificate authority (for shoot certificates via shoot-cert-service)
- **S3-compatible object storage** — For etcd backups (gardener-extension-backup-s3)
- **Git-Hosting with CI/CD** — For GitOps-driven deployment of manifests
- **MetalLB** — For exposing Kubernetes API servers of Shoot clusters (layer 2 load balancing)

#### Operational Features

Gardener provides several day-2 operational capabilities out of the box:

- **Shoot migration** — Control planes can be migrated across Seed clusters for geographic relocation
- **VPN** — Secure connection between control plane components on Seeds and worker nodes
- **Hibernation** — Scale down infrastructure by deleting worker nodes and scaling down control plane components; can be triggered manually or by schedule
- **Maintenance time windows** — End-user configurable windows for automatic updates (Kubernetes versions, machine images)
- **Auto-updates** — Shoot owners can individually enable/disable auto-updates for Kubernetes versions and OS images
- **Certificate rotation** — Automatic rotation where possible; multi-phase rotation for CA changes to avoid workload disruption
- **Fleet management** — Proven at scale (280+ clusters by metal-stack, 10,000+ clusters in production Gardener installations)

#### Related Components

- [Cloud Controller Manager](../../05-Concepts/04-Kubernetes/03-cloud-controller-manager.md) — metal-ccm provides load balancer configuration (MetalLB) and node properties
- [Firewall Controller Manager](../../05-Concepts/04-Kubernetes/04-firewall-controller-manager.md) — firewall rule management via CRDs (nftables, Suricata intrusion detection)

For more details on Gardener terminology, architecture, and operational model, see the [Gardener concept doc](../../05-Concepts/04-Kubernetes/01-gardener.md).

### Cluster-API (Alternative)

[Cluster-API](../../05-Concepts/04-Kubernetes/02-cluster-api.md) is a CNCF project maintained by a Kubernetes SIG that provides declarative cluster management through a management cluster. The metal-stack provider (CAPMS) is **under heavy development** and not yet production-ready.

The [cluster-api-provider-metal-stack (CAPMS)](https://github.com/metal-stack/cluster-api-provider-metal-stack/) infrastructure provider translates CAPI resources into metal-stack API calls for machine, firewall, and IP allocation. CAPMS is tested against the Kubeadm Bootstrap Provider (CABPK) and uses the Add-on Provider for Helm (CAAPH) for installing CNIs like Calico and the metal-ccm.

:::warning
Cluster-API with metal-stack is in early development and not advised for production use. Please use Gardener for production workloads.
:::

#### CAPMS CRDs

CAPMS implements the CAPI infrastructure provider contract for bare metal via metal-stack. The following CRDs are provided:

| CRD                            | Purpose                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `MetalStackCluster`            | Infrastructure cluster resource — allocates a control plane virtual IP (VIP)       |
| `MetalStackMachine`            | Bridges CAPI infrastructure machines to metal-stack machines (bare metal servers)  |
| `MetalStackMachineTemplate`    | Defines reusable machine specs (image, size, etc.) for MetalStackMachine resources |
| `MetalStackFirewallDeployment` | Declares firewall deployments protecting a cluster's network perimeter             |
| `MetalStackFirewallTemplate`   | Provides the configuration template for deployed firewalls                         |

#### Architecture

- **Bootstrap**: Kubeadm (CABPK) generates bootstrap data for joining nodes
- **Add-ons**: ClusterResourceSet + CAAPH for installing CNIs, CCM, and other components
- **CNI**: Calico (default)
- **API exposure**: KubeVIP for exposing the Kubernetes API server (vs. MetalLB in Gardener)
- **External dependencies**: DNS, NTP, ACME, S3-compatible storage, Git-Hosting with CI/CD

For more details on Cluster-API concepts and the CAPMS provider, see the [Cluster-API concept doc](../../05-Concepts/04-Kubernetes/02-cluster-api.md).

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
