---
slug: /deployment/partition
title: Gardener
sidebar_position: 5
---

# Gardener with metal-stack

This guide sets up metal-stack as a cloud provider for [Gardener](https://gardener.cloud/).
Precondition is a metal-stack deployment on the same initial cluster as Gardener, as described in the [control-plane](./03_control-plane.mdx) deployment guide.

Gardener can be deployed with the `gardener-*` [Ansible roles](https://github.com/metal-stack/metal-roles/tree/master/control-plane/roles).

The roles deploy the following components:

- virtual garden
- Gardener control plane components
- soil cluster
- managed seed cluster (into the metal-stack partition)

In summary, this results in the following:

- `Garden cluster` created in the initial cluster
- `soil cluster` created in the initial cluster. This will be the `initial seed` used for spinning up `shooted seeds` in the metal-stack partition
- `shooted seed` inside the metal-stack partition, where all `shoots` are derived from

:::tip
We are officially supported by [Gardener dashboard](https://github.com/gardener/dashboard). The dashboard can also help you setting up some of the resources mentioned above.
:::
