---
slug: /flavors-of-metal-stack
title: Flavors of metal-stack
sidebar_position: 4
---

# Flavors of metal-stack

metal-stack bare metal provisioning offers machines, networks, firewalls and floating IPs. That`s it.

You can consume it as-is... -> [Plain Flavor](#plain)

... or use it as foundation for an orchestrator. We offer two K8s Flavors -> [Gardener](#gardener) and [Cluster API](#cluster-api)

## Plain

All flavors start with this. This is what you get if you set up metal-stack and stop there.

Using plain metal-stack without additional layer was not a focus in the past. Therefore firewall features and role management are quite basic. There is ongoing work on [improved RBAC in MEP-4](/community/MEP-4-multi-tenancy-for-the-metal-api) and [firewall configuration via metal-api in MEP-16](/community/MEP-16-metal-api-as-an-alternative-configuration-source-for-the-firewall-controller).

If you want more features, keep reading.

## Gardener

[Gardener](https://gardener.cloud/) is an open-source managed Kubernetes service. It provides a good "batteries-included" developer experience and should be your first choice for a Kubernetes-as-a-service solution.

We recommend using metal-stack with our [Gardener integration](../05-Concepts/04-Kubernetes/01-gardener.md), which allows to manage Kubernetes clusters at scale. This integration is production-hardened, well documented, used by many organizations in production and build on top of the open-source project [Gardener](https://gardener.cloud/).

## Cluster API

Our [Cluster API integration](https://github.com/metal-stack/cluster-api-provider-metal-stack) is a more experimental approach to provide Kubernetes clusters with metal-stack. It is based on the [Cluster API](https://cluster-api.sigs.k8s.io/) project.

Configuring Cluster API is more verbose then Gardener and will be basically unusable for end users. Cluster API will give you building blocks to build a Kubernetes-as-a-service platform on top of it, but no more. If you need KaaS, use Gardener.
