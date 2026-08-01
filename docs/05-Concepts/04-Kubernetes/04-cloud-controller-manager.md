---
slug: /metal-cloud-controller-manager
title: Cloud Controller Manager
sidebar_position: 4
---

# metal Cloud Controller Manager

The [cloud-controller-manager](https://kubernetes.io/docs/concepts/architecture/cloud-controller/) (CCM) is the bridge between Kubernetes and a cloud provider. metal-stack provides its own implementation, [metal-ccm](https://github.com/metal-stack/metal-ccm), which implements the [Kubernetes cloud provider interface](https://github.com/kubernetes/cloud-provider/blob/master/cloud.go).

## Purpose

metal-ccm provides metal-stack-specific integration for Kubernetes clusters, primarily:

- **Load balancer configuration** — Exposes `Service` resources of type `LoadBalancer` by allocating and announcing public IP addresses via MetalLB
- **Node property management** — Annotates nodes with infrastructure-specific labels (rack, region, zone, chassis) for topology-aware scheduling

## Load Balancer

metal-ccm integrates with [MetalLB](https://metallb.universe.tf/) in BGP mode to expose Kubernetes `Service` resources of type `LoadBalancer`. When a user creates a LoadBalancer service, metal-ccm:

1. Allocates a public IP address from the metal-stack infrastructure pool
2. Configures MetalLB to announce that IP via BGP to the network topology

This provides layer-4 load balancing without requiring dedicated hardware load balancers.

## Node Labels

metal-ccm annotates every worker node with well-known Kubernetes topology labels that reflect the underlying bare-metal infrastructure:

- `machine.metal-stack.io/rack` — The rack where the physical server resides
- `machine.metal-stack.io/chassis` — The chassis identifier
- `topology.kubernetes.io/region` — The geographic region
- `topology.kubernetes.io/zone` — The availability zone or rack

These labels enable end-users to configure Pod topology spread constraints and anti-affinity rules, ensuring high availability of workloads across failure domains.

## Deployment

For Gardener deployments, metal-ccm is deployed as part of the Shoot cluster provisioning flow via the `gardener-extension-provider-metal`. For Cluster API deployments, it is installed through `ClusterResourceSet` objects alongside the CNI (Calico).

For detailed build and deployment instructions, see the [metal-ccm reference guide](../../08-References/Kubernetes/metal-ccm/metal-ccm.md).
