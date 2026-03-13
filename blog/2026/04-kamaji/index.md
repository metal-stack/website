---
title: Kamaji's multi-tenant control-plane on top of metal-stack
shortDescription:
watermark: 'Blog'
date: 2026-03-16T10:00:00+02:00
description: A showcase of kamaji on top of metal-stack using the mini-lab
authors: [mac641, ma-hartma]
type: 'blog'
tags:
  - architecture
  - kamaji
  - mini-lab
---

After getting to know the Kamaji devs at [FOSDEM](https://metal-stack.io/blog/2026/02-fosdem-recap), the idea grew to
explore Kamaji on top of metal-stack. Of course, a first approach had to be made within our mini-lab.

## What is Kamaji?

<!-- ai -->

Kamaji is a Control Plane Manager for Kubernetes, designed to simplify how you run and manage Kubernetes clusters.
Instead of deploying control planes on dedicated machines, Kamaji runs them as pods within a single management cluster,
cutting down on operational overhead and costs. It supports multi-tenancy, high availability, and integrates seamlessly
with Cluster API, making it ideal for private clouds, public clouds, bare metal, and edge computing. With Kamaji, you
get full control over your Kubernetes infrastructure while keeping operations streamlined and scalable. It’s built on
upstream Kubernetes, ensuring compatibility and reliability for production workloads.

<!-- /ai -->

## Architecture

Since Kamaji supports Cluster-API, we noticed that our
[`cluster-api-provider-metal-stack`](https://github.com/metal-stack/cluster-api-provider-metal-stack) and especially the
`capi-lab`, was the best starting point. So we got to work and designed a simple architectural diagram:

![](./overview-kamaji.drawio.svg)

Compared to the mini-lab, the Kamaji flavor in the `capi-lab` leaves every component as is but outsources the control
plane capabilities of metal-stack to the Kamaji Management Cluster. Here you are able to spawn tenants at will with just
one `make` command.
