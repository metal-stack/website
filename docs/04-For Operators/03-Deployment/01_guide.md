---
slug: /deployment-guide
title: Guide
sidebar_position: 1
---

# Deployment Guide

metal-stack is a Metal-as-a-Service (MaaS) platform that turns on-premises bare-metal servers into an elastic, self-managed cloud infrastructure. At its core, metal-stack consists of two components:

- **Control Plane** — The central management layer (APIs, databases, messaging, scheduling)
- **Partitions** — The data center infrastructure (servers, leaf switches, BMCs)

These two components alone provide a fully functional **Bare-Metal as a Service (MaaS)** platform. You can allocate machines, manage networks, configure firewalls, and operate servers via REST/gRPC APIs and the `metalctl` CLI — without any Kubernetes cluster lifecycle management.

## Kubernetes Cluster Lifecycle Management

If you need to provision **Kubernetes clusters** on top of your bare-metal infrastructure, metal-stack integrates with Kubernetes Cluster Lifecycle Management (KCLM) solutions like [Gardener](../../05-Concepts/04-Kubernetes/02-gardener.md) or [Cluster API](../../05-Concepts/04-Kubernetes/03-cluster-api.md). These are **optional layers** built on top of the MaaS foundation — not prerequisites.

:::tip
You can use metal-stack as a pure MaaS platform without any KCLM integration. The KCLM layer is only needed if you want to automate Kubernetes cluster provisioning on your bare-metal infrastructure. See the [KCLM concepts overview](../../05-Concepts/04-Kubernetes/01-kclm.md) for a comparison of the available options.
:::

## Deployment Approach

We bootstrap the [metal control-plane](../../05-Concepts/01-architecture.mdx#metal-control-plane) as well as our [partitions](../../05-Concepts/01-architecture.mdx#partitions) with [Ansible](https://www.ansible.com/) through CI.

The deployment has multiple phases, resulting in a Git repository containing Ansible playbooks, inventory files and CI/CD workflows.

1. **[Bootstrap Infrastructure](./02_bootstrap-infrastructure.md)** — Decide where the initial Kubernetes cluster(s) that host metal-stack and, optionally, your KCLM run. This is a planning phase, not an Ansible deployment.
2. **[Control Plane](./03_control-plane.mdx)** — Deploy the metal-stack APIs, databases and ingress onto the initial Kubernetes cluster. This alone gives you a functional MaaS platform.
3. **[Partition](./04_partition.md)** — Bootstrap the out-of-band network, configure the network fabric (leaf, spine and exit switches, DHCP, PXE) and connect your bare-metal servers to the control plane.
4. **[KCLM with Gardener](./05_gardener.md)** — Add Gardener to manage the Kubernetes cluster lifecycle on your bare-metal infrastructure. Alternatively, see [Cluster API](./06_cluster-api.md).

Two cross-cutting topics complete the picture once the platform runs: [GPU Workers](./07-gpu-workers.md) and [Offline Resilience](./08_offline-resilience.md).

By the end of this guide, your deployment repository will look something like this:

```text
my-metal-stack-deployment/
├── ansible.cfg
├── deploy_metal_control_plane.yaml      # Control plane
├── deploy_gardener.yaml                 # KCLM (optional)
├── deploy_mgmt_servers.yaml             # Partition: management servers
├── deploy_mgmt_switches.yaml            # Partition: management switches
├── deploy_spines_exits.yaml             # Partition: spine and exit switches
├── deploy_leaves.yaml                   # Partition: leaf switches
├── inventories/
│   ├── control-plane.yaml               # inventory for the Kubernetes deployments
│   ├── partition.yaml                   # inventory for the partition hosts
│   ├── group_vars/                      # variables per host group
│   └── host_vars/                       # variables per host
├── roles/                               # custom Ansible roles
├── files/                               # certificates, keys, static assets
└── .github/workflows/                   # CI/CD pipelines
```

The different phases of the deployment guide show which files to add and how they fit into this structure.

:::tip
The [mini-lab](https://github.com/metal-stack/mini-lab) is the fastest way to see a complete, runnable parametrization of the very same Ansible roles. It brings up a virtualized metal-stack — including an optional Gardener or Kamaji landscape — on a single machine.

Treat it as a **reference for how the roles are wired together, not as a production blueprint.** The mini-lab intentionally cuts corners that are unacceptable in production: it runs on a single [kind](https://kind.sigs.k8s.io/) cluster, ships unencrypted secrets, fakes the `kube-system/shoot-info` ConfigMap and patches load balancer statuses by hand. Wherever this guide references the mini-lab, it does so to point at a concrete example — never as a recommendation.
:::

We recommend using the same Ansible roles that we use to deploy metal-stack in our own environments. They are available in the [metal-roles](https://github.com/metal-stack/metal-roles) repository, split into [`control-plane`](https://github.com/metal-stack/metal-roles/tree/master/control-plane), [`partition`](https://github.com/metal-stack/metal-roles/tree/master/partition) and [`common`](https://github.com/metal-stack/metal-roles/tree/master/common) roles. Every role carries a `README.md` that documents its variables — these READMEs are the authoritative variable reference, while this guide focuses on the red line through the deployment.

To simplify dependency management, we provide a dedicated [deployment base image](https://github.com/metal-stack/metal-deployment-base) on GitHub Container Registry. This container image bundles all required tools and libraries (Ansible, `kubectl`, `helm`, `cosign`, `metalctl`, …), keeping your deployment environment lean, reproducible and easy to maintain — locally and in CI.

## What You Need to Know

This guide assumes you are comfortable with the following. It does not teach them:

- **Kubernetes** — You will operate metal-stack on Kubernetes and troubleshoot it with `kubectl`.
- **Ansible** — All deployments are Ansible playbooks and roles. Refer to [docs.ansible.com](https://docs.ansible.com/) if you are new to it; you do not need to be an expert to follow along, but you will write playbooks.
- **Data center networking** — BGP, VRFs, EVPN/VXLAN and DHCP/PXE. The [networking concepts](../../05-Concepts/03-Network/01-theory.md) chapter explains how metal-stack uses them.
- **Your KCLM of choice** — If you plan to deploy [Gardener](./05_gardener.md) or [Cluster API](./06_cluster-api.md), you should already be familiar with its own concepts and terminology.

Every deployment environment is unique. This guide describes how we set up metal-stack in our own infrastructure — you will need to adapt the steps to match your hardware, network and compliance requirements. Make sure you have [Docker](https://docs.docker.com/get-started/get-docker/) (or a compatible container runtime) installed to run the deployment base image.

:::info
If you do not want to use Ansible for deployment, you need to come up with a deployment mechanism by yourself. You can still learn from our [metal-roles](https://github.com/metal-stack/metal-roles) repository and [Helm charts](https://github.com/metal-stack/helm-charts/) — but be aware that the Ansible roles tie everything together (variable management, dependency ordering, environment-specific configuration), so building an equivalent from scratch will require significant effort.
:::

:::tip
Stuck? The [troubleshooting guide](../06-troubleshoot.md) collects the issues we run into most often, and the [community page](/community) tells you how to reach us. Feedback on this guide is explicitly welcome — it is how we make the deployment easier for the next operator.
:::
