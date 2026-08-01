---
slug: /deployment/cluster-api
title: Cluster API (KCLM)
sidebar_position: 6
---

# Cluster API for Kubernetes Cluster Lifecycle Management

This section covers deploying [Cluster API](../../05-Concepts/04-Kubernetes/03-cluster-api.md) on top of your existing metal-stack infrastructure. Cluster API with metal-stack is a declarative cluster management framework — you declare the desired state of your clusters and the Cluster API controllers reconcile the actual state.

This guide does **not** use Ansible roles. Unlike Gardener, which is deployed via the `gardener-*` metal-roles, Cluster API with metal-stack is set up directly through `clusterctl` and the [cluster-api-provider-metal-stack (CAPMS)](https://github.com/metal-stack/cluster-api-provider-metal-stack/) infrastructure provider.

:::warning[Beta]
Cluster API with metal-stack is in beta and not yet recommended for production workloads. Please use [Gardener](./05_gardener.md) for production deployments. We are actively looking for exchange and adopters — if you are interested in using Cluster API with metal-stack, please [join our community](/community) to help shape future integration efforts.
:::

## Prerequisites

Before deploying Cluster API, ensure the following infrastructure is in place:

- **Management cluster** — A Kubernetes cluster to host the Cluster API controllers and the desired cluster state. This can be any Kubernetes distribution (kind, k3s, a Gardener Shoot, or any managed Kubernetes). It must have network access to your metal-stack infrastructure.
- **metal-stack infrastructure** — A running metal-stack installation with at least one partition with available machines and operating system images (see [metal-images](https://github.com/metal-stack/metal-images) for pre-built ones).
- **CLI tools** — `metalctl` for communicating with the metal-stack API ([installation](https://github.com/metal-stack/metalctl)) and `clusterctl` for initializing providers and generating cluster manifests.
- **External dependencies** — DNS, NTP, ACME (optional), S3-compatible storage for backups, and Git-Hosting with CI/CD for GitOps-driven deployment.

## Deployment

Cluster API with metal-stack is deployed through the [cluster-api-provider-metal-stack (CAPMS)](https://github.com/metal-stack/cluster-api-provider-metal-stack/) infrastructure provider. The [CAPMS reference documentation](../../08-References/Kubernetes/cluster-api-provider-metal-stack/cluster-api-provider-metal-stack.md) covers the deployment in detail.

**Deployment flow**

1. **Prepare management cluster** — A Kubernetes cluster to host CAPI and CAPMS providers and cluster state
2. **Install CAPMS** — Deploy the CAPMS provider into the management cluster
3. **Configure `clusterctl`** — Register the metal-stack provider URL and set environment variables (API credentials, project, partition, machine images and sizes, cluster name, Kubernetes version)
4. **Allocate resources** — Create node networks, firewalls, and control plane IPs via `metalctl`
5. **Generate and apply cluster manifest** — Use `clusterctl generate cluster` to produce a YAML with `Cluster`, `MetalStackCluster`, `KubeadmControlPlane`, `MachineDeployment`, and `MetalStackMachine` resources, then apply it
6. **Deploy add-ons** — Install CNI (Calico) and `metal-ccm` via `ClusterResourceSet` and CAAPH
7. **Retrieve kubeconfig** — Access the provisioned cluster

**Network integration**

Network integration for Cluster API is currently more manual compared to Gardener. Node networks must be created manually via `metalctl` and provided as environment variables. IP addresses for the control plane also need to be allocated in advance through `metalctl`. Firewall rules are currently static and can be applied to firewall nodes; no automatic firewall controller is in place yet. Automatic network resource allocation is on the roadmap for CAPMS.

For service exposure, CAPMS uses KubeVIP in BGP mode to allocate and announce public IPs, similar to the MetalLB-based approach in Gardener.

**Air-gapped environments**

For air-gapped deployments, follow the [Cluster API Operator air-gapped environment guide](https://cluster-api-operator.sigs.k8s.io/topics/configuration/air-gapped-environtment). All required images must be mirrored to an OCI registry reachable from the management cluster.

## Kamaji as Control Plane Provider

[Kamaji](https://kamaji.clastix.io/) is a Control Plane Manager for Kubernetes that runs control planes as pods within a management cluster, reducing operational overhead and costs. It integrates with Cluster API as a `ControlPlaneProvider`.

:::warning
Kamaji integrations with metal-stack have not been evaluated in production-grade scenarios. This is a lab-only showcase.
:::

Kamaji acts as a `ControlPlaneProvider` with Cluster API, while CAPMS acts as the `InfrastructureProvider`. This setup manages **tenant clusters** on metal-stack infrastructure, combining Kamaji's control plane management with metal-stack's bare-metal provisioning.

**Deployment**

1. **Prepare management cluster** — A Kubernetes cluster to host Kamaji and CAPMS providers
2. **Install Kamaji and CAPMS** — Deploy both providers into the management cluster
3. **Create a control plane VIP** — MetalLB assigns a virtual IP for the tenant API server
4. **Generate and apply tenant cluster manifest** — Use `clusterctl generate cluster` to produce a YAML with `Cluster`, `MetalStackCluster`, `KubeadmControlPlane`, `MachineDeployment`, and `MetalStackMachine` resources, then apply it
5. **Deploy add-ons** — Install CNI (Calico) and `metal-ccm` into the tenant cluster

A working showcase is available in the [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/blob/main/DEVELOPMENT.md#running-the-kamaji-flavor) setup, which extends the `mini-lab` with a Kamaji flavor. See our [blog post](/blog/2026/04-kamaji) for a detailed walkthrough of the architecture and setup.

**Fleet management and GitOps**

Since Kamaji with metal-stack uses Cluster API under the hood, fleet management follows the same pattern as Cluster API. Tenant cluster manifests are generated via `clusterctl`, stored in Git, and deployed through your CI/CD pipeline.

## Fleet Management and GitOps

You must set up your own Git repository and GitOps operator to manage cluster deployments.

**What you need to build:**

1. **Git repository** — Store cluster manifests generated via `clusterctl generate cluster <cluster-name>`. Each cluster gets its own set of YAML files containing `Cluster`, `MetalStackCluster`, `KubeadmControlPlane`, `MachineDeployment`, and `MetalStackMachine` resources.
2. **GitOps operator** — Deploy ArgoCD or FluxCD to watch your Git repository and apply manifests to the management cluster, ensuring drift-free declarative delivery.
3. **Per-cluster CI/CD** — Essential components (CNI, CCM) are rolled out on a per-cluster basis. Changes to `MachineTemplate` or `ClusterResourceSet` are staged through the Git repository with standard approval processes.

**Platform capabilities:**

- **Cluster migration** — `clusterctl move` enables moving workload cluster resources between management clusters, pausing controllers during the move to prevent worker node loss
- **Emergency patching** — Achieved through editing resources in the management cluster, e.g., update of machine OS image in the `MachineTemplate` or update of `ClusterResourceSet`. Unlike Gardener, this change is not rolled out fleet-wide automatically and should be staged through the Git repository with standard approval processes
- **Certificate rotation** — No direct workflow is described for certificate rotation at the landscape level; this is to be defined by platform administrators using manual/custom processes based on standard tooling (e.g., `kubeadm` certificate renewal)
- **Audit configuration** — Audit configuration can be passed to the kube-apiserver via the `kubeadmConfigSpec` of the `KubeadmControlPlane` resource before cluster creation. Each cluster can have its own audit policy. The management cluster's kube-apiserver audit also needs to be configured separately. Cluster API does not provide a centralized audit management toolset.

## Available Flavors

CAPMS provides different [cluster template flavors](https://cluster-api.sigs.k8s.io/cluster-api/commands/generate-cluster.html#flavors) for `clusterctl generate cluster`:

| Flavor | Description | K8s Compatibility |
|--------|-------------|-------------------|
| *(default)* | Expects the user to deploy a CNI and a CCM manually | >= v1.33 |
| `calico` | Installs Calico CNI + metal-ccm via `ClusterResourceSet` and CAAPH | >= v1.33 |
| `pre-v1.33` | Same as default but for Kubernetes versions < v1.33 | < v1.33 |
| `kamaji-tenant` | Kamaji tenant cluster template (requires Kamaji installed) | >= v1.33 |

## Next Steps

- **[KCLM Overview](./05_kclm.md)** — Introduction to Kubernetes Cluster Lifecycle Management with metal-stack
- **[Gardener Deployment Guide](./05_gardener.md)** — metal-stack's recommended, production-ready KCLM solution
- **[Cluster API Concepts](../../05-Concepts/04-Kubernetes/03-cluster-api.md)** — Architecture, operational model, and control plane hosting
- **[CAPMS Reference](../../08-References/Kubernetes/cluster-api-provider-metal-stack/cluster-api-provider-metal-stack.md)** — Full CAPMS documentation
- **[CAPMS Development Guide](../../08-References/Kubernetes/cluster-api-provider-metal-stack/DEVELOPMENT.md)** — Local development with capi-lab
- **[Kamaji Blog Post](/blog/2026/04-kamaji)** — Architecture and setup walkthrough


