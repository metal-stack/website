---
slug: /deployment-guide
title: Guide
sidebar_position: 1
---

# Deployment Guide

metal-stack is a Metal-as-a-Service (MaaS) platform that turns on-premises bare-metal servers into an elastic, self-managed cloud infrastructure. At its core, metal-stack consists of two components:

- **Control Plane** — The central management layer (APIs, databases, scheduling)
- **Partitions** — The data center infrastructure (servers, leaf switches, BMCs)

These two components alone provide a fully functional **Bare-Metal as a Service (MaaS)** platform. You can allocate machines, manage networks, configure firewalls, and operate servers via REST/gRPC APIs and the `metalctl` CLI — without any Kubernetes cluster lifecycle management.

## Kubernetes Cluster Lifecycle Management

If you need to provision **Kubernetes clusters** on top of your bare-metal infrastructure, metal-stack integrates with KCLM solutions like [Gardener](../../05-Concepts/04-Kubernetes/01-gardener.md) or [Cluster-API](../../05-Concepts/04-Kubernetes/02-cluster-api.md). These are **optional layers** built on top of the MaaS foundation — not prerequisites.

:::tip
You can use metal-stack as a pure MaaS platform without any KCLM integration. The KCLM layer is only needed if you want to automate Kubernetes cluster provisioning on your bare-metal infrastructure.
:::

### Deployment Approach

We bootstrap the [metal control-plane](../../05-Concepts/01-architecture.mdx#metal-control-plane) as well as our [partitions](../../05-Concepts/01-architecture.mdx#partitions) with [Ansible](https://www.ansible.com/) through CI.

The deployment has multiple phases, resulting in a Git repository containing Ansible playbooks, inventory files and CI/CD workflows.

1. **[Control Plane](./03_control-plane.mdx)** — Deploy the metal-stack API, databases, and ingress on a bootstrap Kubernetes cluster. This alone gives you a functional MaaS platform.
2. **[Partition](./04_partition.md)** — Configure the network fabric (leaf switches, management spine, DHCP, PXE) and connect your bare-metal servers to the control plane.
3. **[KCLM with Gardener](./05_kclm.md)** — Add Gardener to manage Kubernetes cluster lifecycle on your bare-metal infrastructure.

By the end of this guide, your deployment repository will look something like this:

```
my-metal-stack-deployment/
├── deploy_metal_stack.yaml              # Control plane
├── deploy_partition.yaml                # Partition
├── deploy_gardener.yaml                 # KCLM
├── inventory/
│   ├── inventory.yaml
│   ├── group_vars/                      # Variables per host group
│   └── host_vars/                       # Variables per host
├── roles/                               # Custom Ansible roles
├── files/
└── .github/workflows/                   # CI/CD pipelines
```

The different phases of the deployment guide show which files to add and how they fit into this structure.

:::tip
You can use the [mini-lab](https://github.com/metal-stack/mini-lab) as a template project for your own deployment. It uses the same approach as described in this guide.
:::

We recommend using the same Ansible roles that we use to deploy metal-stack in our own environments. They are available in the [metal-roles](https://github.com/metal-stack/metal-roles) repository.

To simplify dependency management, we provide a dedicated [deployment base image](https://github.com/metal-stack/metal-deployment-base) on GitHub Container Registry. This Docker image bundles all required tools and libraries, keeping your deployment environment lean and easy to maintain.

The remainder of this guide assumes you are using our Ansible roles and the deployment base image. Make sure you have [Docker](https://docs.docker.com/get-started/get-docker/) installed. Every deployment environment is unique, so this guide describes how we set up metal-stack in our own infrastructure. You will need to adapt the steps to match your specific requirements.

:::warning
You will likely need to learn to write Ansible playbooks if you want to be able to deploy the metal-stack as presented in this documentation. However, even when starting without any knowledge of Ansible it should be possible to follow these docs. In case you need further explanations regarding Ansible please refer to [docs.ansible.com](https://docs.ansible.com/).
:::

:::info
If you do not want to use Ansible for deployment, you need to come up with a deployment mechanism by yourself. You can still learn from our [metal-roles](https://github.com/metal-stack/metal-roles) repository and [Helm charts](https://github.com/metal-stack/helm-charts/) — but be aware that the Ansible roles tie everything together (variable management, dependency ordering, environment-specific configurations), so building an equivalent from scratch will require significant effort.
:::
