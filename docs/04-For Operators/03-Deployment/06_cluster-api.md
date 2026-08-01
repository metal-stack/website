---
slug: /deployment/cluster-api
title: Cluster API (KCLM)
sidebar_position: 6
---

# Cluster API for Kubernetes Cluster Lifecycle Management

This section covers deploying [Cluster API](../../05-Concepts/04-Kubernetes/03-cluster-api.md) on top of your existing metal-stack infrastructure. Cluster API with metal-stack is a declarative cluster management framework — you declare the desired state of your clusters and the Cluster API controllers reconcile the actual state.

This guide does **not** use Ansible roles. Unlike Gardener, which is deployed via the `gardener-*` [metal-roles](https://github.com/metal-stack/metal-roles/tree/master/control-plane), Cluster API with metal-stack is set up directly through `clusterctl` and the [cluster-api-provider-metal-stack (CAPMS)](https://github.com/metal-stack/cluster-api-provider-metal-stack/) infrastructure provider. Consequently, the [Control Plane](./03_control-plane.mdx) and [Partition](./04_partition.md) guides still apply unchanged — only this KCLM layer differs.

:::warning[Beta]
Cluster API with metal-stack is in beta and not yet recommended for production workloads. Please use [Gardener](./05_gardener.md) for production deployments. We are actively looking for exchange and adopters — if you are interested in using Cluster API with metal-stack, please [join our community](/community) to help shape future integration efforts.
:::

:::info
Because Cluster API is a framework rather than a platform, this page is deliberately shorter than the [Gardener guide](./05_gardener.md): there is far less to configure, but substantially more day-2 tooling to build yourself. The [Cluster API concepts page](../../05-Concepts/04-Kubernetes/03-cluster-api.md#what-to-build-yourself) lists exactly what that entails, and the [KCLM decision matrix](../../05-Concepts/04-Kubernetes/01-kclm.md#decision-matrix) puts it into perspective.
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

Network integration for Cluster API is more manual than for Gardener, and this is the part that surprises most operators coming from the Gardener path:

- Node networks must be created up front via `metalctl network allocate` and handed to `clusterctl` as environment variables.
- Control plane IPs must be acquired in advance with `metalctl network ip create`.
- Firewall rules are static — there is no [firewall-controller-manager](../../05-Concepts/04-Kubernetes/05-firewall-controller-manager.md) integration yet, so no `ClusterWideNetworkPolicy` reconciliation.
- Service exposure uses KubeVIP in BGP mode instead of MetalLB.

Automatic network resource allocation is on the CAPMS roadmap. Until then, plan these resources as part of your GitOps repository so they do not drift.

**Air-gapped environments**

For air-gapped deployments, follow the [Cluster API Operator air-gapped environment guide](https://cluster-api-operator.sigs.k8s.io/topics/configuration/air-gapped-environtment). All required images must be mirrored to an OCI registry reachable from the management cluster. On the metal-stack side, combine this with [Offline Resilience](./08_offline-resilience.md) so that machine provisioning itself does not depend on the internet.

## Kamaji as Control Plane Provider

[Kamaji](https://kamaji.clastix.io/) is a Control Plane Manager for Kubernetes that runs tenant control planes as pods inside the management cluster instead of on dedicated worker nodes. It plugs into Cluster API as a `ControlPlaneProvider`, while CAPMS remains the `InfrastructureProvider`. Conceptually this gets you close to Gardener's control plane hosting model — see [Cluster API + Kamaji](../../05-Concepts/04-Kubernetes/01-kclm.md#cluster-api--kamaji-the-middle-ground) for the trade-offs.

:::warning
Kamaji integrations with metal-stack **have not been evaluated in production-grade scenarios** by metal-stack. We are actively looking for exchange and adopters — if you are interested in using Kamaji with metal-stack, please [join our community](/community) to help shape future integration efforts.
:::

**Deployment**

1. **Prepare management cluster** — A Kubernetes cluster to host Kamaji and CAPMS providers
2. **Install Kamaji and CAPMS** — Deploy both providers into the management cluster
3. **Create a control plane VIP** — MetalLB assigns a virtual IP for the tenant API server
4. **Generate and apply the tenant cluster manifest** — Use `clusterctl generate cluster --flavor kamaji-tenant`, then apply the result
5. **Deploy add-ons** — Install CNI (Calico) and `metal-ccm` into the tenant cluster

A working showcase is available in the [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/blob/main/DEVELOPMENT.md#running-the-kamaji-flavor) setup, which extends the `mini-lab` with a Kamaji flavor. See our [blog post](/blog/2026/04-kamaji) for a detailed walkthrough of the architecture and setup.

Because Kamaji sits underneath Cluster API, everything in the following section applies unchanged.

## Fleet Management and GitOps

Cluster API ships no fleet management of its own — you set up the Git repository and GitOps operator yourself:

1. **Git repository** — Store the manifests generated via `clusterctl generate cluster <cluster-name>`. Each cluster gets its own set of YAML files containing `Cluster`, `MetalStackCluster`, `KubeadmControlPlane`, `MachineDeployment` and `MetalStackMachine` resources, plus the pre-allocated networks and IPs.
2. **GitOps operator** — Deploy Argo CD or Flux to watch the repository and apply manifests to the management cluster, ensuring drift-free declarative delivery.
3. **Per-cluster CI/CD** — Essential components (CNI, CCM) are rolled out per cluster. Changes to a `MetalStackMachineTemplate` or `ClusterResourceSet` are staged through the repository with the usual approval process — they are **not** rolled out fleet-wide automatically as they would be with Gardener.

Use multi-stage environments (staging → production) and validate manifests in CI to keep the risk of platform changes manageable.

For the day-2 capabilities this model does and does not give you — cluster migration via `clusterctl move`, emergency patching, certificate rotation, audit configuration — see [Cluster API concepts](../../05-Concepts/04-Kubernetes/03-cluster-api.md#fleet-management-and-gitops).

## Available Flavors

CAPMS provides different [cluster template flavors](https://cluster-api.sigs.k8s.io/cluster-api/commands/generate-cluster.html#flavors) for `clusterctl generate cluster`:

| Flavor          | Description                                                        | K8s Compatibility |
| --------------- | ------------------------------------------------------------------ | ----------------- |
| _(default)_     | Expects the user to deploy a CNI and a CCM manually                | >= v1.33          |
| `calico`        | Installs Calico CNI + metal-ccm via `ClusterResourceSet` and CAAPH | >= v1.33          |
| `pre-v1.33`     | Same as default but for Kubernetes versions < v1.33                | < v1.33           |
| `kamaji-tenant` | Kamaji tenant cluster template (requires Kamaji installed)         | >= v1.33          |
