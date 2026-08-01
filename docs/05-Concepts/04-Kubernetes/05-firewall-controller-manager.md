---
slug: /firewall-controller-manager
title: Firewall Controller Manager
sidebar_position: 5
---

# Firewall Controller Manager

The firewall-controller-manager (FCM) is a collection of controllers responsible for managing the lifecycle of firewalls in a [Gardener](https://gardener.cloud/) shoot cluster for the metal-stack provider.

The FCM is typically deployed into the shoot namespace of a seed cluster by the [gardener-extension-provider-metal](https://github.com/metal-stack/gardener-extension-provider-metal/).

The design of the FCM is inspired by Gardener's [machine-controller-manager](https://github.com/gardener/machine-controller-manager) and Kubernetes' built-in resources `Deployment`, `ReplicaSet` and `Pod`.

## Architecture

The FCM introduces the following [CRDs](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/):

| Custom Resource | Description |
|----------------|-------------|
| `FirewallDeployment` | Contains the spec template of a `Firewall` resource, similar to a `Deployment`. Implements update strategies like rolling update. |
| `FirewallSet` | Similar to `ReplicaSet`. Typically owned by a `FirewallDeployment`. Attempts to run the defined number of `Firewall` replicas. |
| `Firewall` | Similar to a `Pod`. Has a 1:1 relationship to a firewall in the metal-stack API. |
| `FirewallMonitor` | Deployed into the user's shoot cluster. Useful for monitoring the firewall or triggering user-initiated actions. |

### Controllers

| Controller | Responsibility |
|------------|---------------|
| `FirewallDeploymentController` | Manages the lifecycle of `FirewallSet`s. Syncs the `Firewall` template spec and triggers a `FirewallSet` roll when significant changes are made. Supports `RollingUpdate` and `Recreate` strategies. Also deploys a service account for the firewall-controller. |
| `FirewallSetController` | Creates and deletes `Firewall` objects according to the spec and replica count. Reports `Firewall` status. |
| `FirewallController` | Creates and deletes the physical firewall machine via the [metal-api](https://github.com/metal-stack/metal-api). |

## User Actions

The FCM exposes user-facing capabilities through annotations on `FirewallMonitor` and `Firewall` resources:

- **FirewallSet rolling** — Users can trigger a rolling update of the current firewall set by annotating a `FirewallMonitor`. This is useful when firewall configuration changes need to be applied.
- **Systemd service restart** — Users can restart systemd services on a firewall node by annotating a `FirewallMonitor`. The firewall-controller enforces a whitelist of allowed services. Operators can override this whitelist by annotating the `Firewall` resource directly.

## Deployment

The FCM is deployed into the shoot namespace of a seed cluster as part of the Gardener extension provisioning flow.

For detailed configuration and development instructions, see the [firewall-controller-manager reference guide](../../08-References/Kubernetes/firewall-controller-manager/firewall-controller-manager.md).

For detailed configuration and development instructions, see the [firewall-controller-manager reference guide](../../08-References/Kubernetes/firewall-controller-manager/firewall-controller-manager.md).

## Next Steps

- **[KCLM Overview](./01-kclm.md)** — Introduction to Kubernetes Cluster Lifecycle Management
- **[Gardener](./02-gardener.md)** — Gardener integration
- **[Cluster API](./03-cluster-api.md)** — Cluster API integration
- **[Firewall Controller Manager Reference](../../08-References/Kubernetes/firewall-controller-manager/firewall-controller-manager.md)** — Detailed configuration and development instructions
