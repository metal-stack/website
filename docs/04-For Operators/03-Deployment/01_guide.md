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

## Deployment Approaches

We are bootstrapping the [metal control plane](../../05-Concepts/01-architecture.mdx#metal-control-plane) as well as our [partitions](../../05-Concepts/01-architecture.mdx#partitions) with [Ansible](https://www.ansible.com/) through CI.

In order to build up your deployment, we recommend to make use of the same Ansible roles that we are using by ourselves in order to deploy the metal-stack. You can find them in the repository called [metal-roles](https://github.com/metal-stack/metal-roles).

In order to wrap up deployment dependencies there is a special [deployment base image](https://github.com/metal-stack/metal-deployment-base/pkgs/container/metal-deployment-base) hosted on GitHub that you can use for running the deployment. Using this Docker image eliminates a lot of moving parts in the deployment and should keep the footprints on your system fairly small and maintainable.

This document will from now on assume that you want to use our Ansible deployment roles for setting up metal-stack. We will also use the deployment base image, so you should also have [Docker](https://docs.docker.com/get-started/get-docker/) installed. It is in the nature of software deployments to differ from site to site, company to company, user to user. Therefore, we can only describe how the deployment works for us. It is up to you to tweak the deployment described in this document to your requirements.

:::warning
Probably you need to learn writing Ansible playbooks if you want to be able to deploy the metal-stack as presented in this documentation. However, even when starting without any knowledge about Ansible it should be possible to follow these docs. In case you need further explanations regarding Ansible please refer to [docs.ansible.com](https://docs.ansible.com/).
:::

:::info
If you do not want to use Ansible for deployment, you need to come up with a deployment mechanism by yourself. You can still learn from our [metal-roles](https://github.com/metal-stack/metal-roles) repository and [Helm charts](https://github.com/metal-stack/helm-charts/) — but be aware that the Ansible roles tie everything together (variable management, dependency ordering, environment-specific configurations), so building an equivalent from scratch will require significant effort.
:::

:::tip
You can use the [mini-lab](https://github.com/metal-stack/mini-lab) as a template project for your own deployment. It uses the same approach as described in this document.
:::
