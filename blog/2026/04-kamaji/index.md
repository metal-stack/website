---
title: Kamaji flavor for the mini-lab
shortDescription:
watermark: "Blog"
date: 2026-03-26T10:00:00+02:00
description: "A showcase of Kamaji on top of metal-stack using the mini-lab"
authors: [mac641, ma-hartma]
type: "blog"
tags:
  - architecture
  - kamaji
  - mini-lab
  - cluster-api
  - cluster-api-provider-metal-stack
---

We are happy to announce that [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack) — our Cluster API extension of [`mini-lab`](https://github.com/metal-stack/mini-lab) — showcases a _Kamaji_ flavor now. 🥳

After getting to know the _Kamaji_ devs at [FOSDEM](https://metal-stack.io/blog/2026/02-fosdem-recap), the idea grew to explore _Kamaji_ on top of metal-stack.
In this blog post we are going to give you some insights on how to provision _Kamaji_ **tenant clusters** on metal-stack
and what the architecture looks like.
You will also get some pointers on how to get started with _Kamaji_ and metal-stack yourself, based on our [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack) setup.

## What is _Kamaji_?

<!-- ai -->

[Kamaji](https://github.com/clastix/kamaji) is a Control Plane Manager for Kubernetes, designed to simplify how you run and manage Kubernetes clusters.
Instead of deploying control planes on dedicated machines, _Kamaji_ runs them as pods within a single management
cluster, cutting down on operational overhead and costs. It supports multi-tenancy, high availability, and integrates
seamlessly with Cluster API, making it ideal for private clouds, public clouds, bare metal, and edge computing.

<!-- /ai -->

## Architecture
So how do metal-stack and _Kamaji_ work together? 

Our focus is on showcasing how _Kamaji_ can manage Kubernetes clusters on top of metal-stack via [Cluster API](https://cluster-api.sigs.k8s.io/), rather than running _Kamaji_ itself on metal-stack.

_Kamaji_'s support for Cluster API allows us to use our existing [`cluster-api-provider-metal-stack`](https://github.com/metal-stack/cluster-api-provider-metal-stack) to provision and manage _Kamaji_ **tenant clusters** that _Kamaji_ oversees.
This allows us to leverage the strengths of both platforms: metal-stack for bare-metal provisioning and _Kamaji_ for streamlined Kubernetes cluster management.

The architecture looks as follows when you run the `capi-lab` with the _Kamaji_ flavor on your local machine:
![Kamaji Architecture Overview](./overview-kamaji.svg)

We launch a [kind](https://kind.sigs.k8s.io/) cluster, which serves as the _Kamaji_ **management cluster**. This cluster is responsible for running the _Kamaji_ control plane components and managing the lifecycle of **tenant clusters**.

We also have the metal-stack control plane running inside that same kind cluster, connected to a metal-stack partition which is virtually deployed via [containerlab](https://containerlab.dev/).
There are two machines in the partition, just waiting to be provisioned.

The final component is `CAPMS`, the Cluster API Provider for Metal Stack, which is responsible for provisioning and managing the **tenant clusters** on metal-stack. It interacts with the metal-stack APIs to create and manage the necessary resources for the **tenant clusters**, after _Kamaji_ has requested them and is also running in the kind cluster.


## Setup
The setup fits in quite well with our existing [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack), since it already has a lot of the components in place that we need for _Kamaji_:
- A [kind](https://kind.sigs.k8s.io/) cluster to run the _Kamaji_ control plane components on
- A metal-stack partition with machines to provision **tenant clusters** on
- `cluster-api-provider-metal-stack` with Cluster API Bootstrap Provider Kubeadm (CABPK) support to manage the lifecycle of **tenant clusters** on metal-stack
- Images with ignition support to join machines via `kubeadm` and `kubelet`

Some rewiring was necessary to make the components work together:

### Deploying _Kamaji_
The _Kamaji_ control plane components are deployed into the kind cluster with additional Ansible roles, reproducing the [Kamaji Kind setup](https://kamaji.clastix.io/getting-started/kamaji-kind/).

### Kamaji as ControlPlaneProvider and CAPMS as InfrastructureProvider
_Kamaji_ is deployed as a `ControlPlaneProvider` in the kind cluster, while `CAPMS` is deployed as an `InfrastructureProvider`.
We set up the providers via `clusterctl init --control-plane kamaji --infrastructure metal-stack` and configured the necessary RBAC permissions for _Kamaji_ to be allowed to manage the **tenant clusters** via `CAPMS`.

### A cluster template for Kamaji tenant clusters
Before we can spawn **tenant clusters** with _Kamaji_, we need to describe how they should look. This is done via a cluster template, which defines the configuration for the **tenant clusters**.
The [official template](https://kamaji.clastix.io/cluster-api/control-plane-provider/) needs some adjustments to work with our setup, leading to a [custom template](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/config/clusterctl-templates/cluster-template-kamaji-tenant.yaml) in our [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack) repository.

### Provisioning tenant clusters
With the **management cluster** running and the template in place, we can now generate **tenant cluster** manifests with `clusterctl generate cluster` and apply them. _Kamaji_ will then take care of provisioning the **tenant clusters** on metal-stack via `CAPMS`.
At least one firewall and worker node are provisioned for each **tenant cluster**, and the control plane components are deployed as pods in the **management cluster**.
The **tenant cluster** control plane is accessible via an IP address provided by metal-stack, and the worker nodes join via CABPK and `kubeadm`.

### Getting tenant clusters up and running
Once the **tenant cluster** provisioning is triggered, _Kamaji_ will manage its lifecycle.
For metal-stack deployments to get fully ready, [`metal-ccm`](https://github.com/metal-stack/metal-ccm) needs to be deployed into the **tenant cluster**.
A CNI can then be installed to get the **tenant cluster** fully operational.

## Getting started
Head over to the [`cluster-api-provider-metal-stack`](https://github.com/metal-stack/cluster-api-provider-metal-stack)
and follow the setup instructions in `DEVELOPMENT.md` to try it out yourself.
