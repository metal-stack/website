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

We are happy to announce that
[`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab) — our Cluster API
extension of [`mini-lab`](https://github.com/metal-stack/mini-lab) — contains a _Kamaji_ flavor now. 🥳

After getting to know the _Kamaji_ devs at [FOSDEM](https://metal-stack.io/blog/2026/02-fosdem-recap), the idea grew to
explore _Kamaji_ on top of _metal-stack_. In this blog post we are going to give you some insights on how to provision
_Kamaji_ **tenant clusters** on _metal-stack_ and what the architecture looks like. You will also gain further insights
on how to get started with _Kamaji_ and _metal-stack_ yourself, based on our
[`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab) setup.

## What is _Kamaji_?

<!-- ai -->

[_Kamaji_](https://github.com/clastix/kamaji) is a Control Plane Manager for Kubernetes, designed to simplify how you
run and manage Kubernetes clusters. Instead of deploying control planes on dedicated machines, _Kamaji_ runs them as
pods within a single management cluster, cutting down on operational overhead and costs. It supports multi-tenancy, high
availability, and integrates seamlessly with Cluster API, making it ideal for private clouds, public clouds, bare metal,
and edge computing.

<!-- /ai -->

## Architecture

> How can _metal-stack_ and _Kamaji_ co-operate?

Our focus is on showcasing how _Kamaji_ can manage Kubernetes clusters on top of _metal-stack_ via
[Cluster API](https://cluster-api.sigs.k8s.io/), rather than running _Kamaji_ itself on _metal-stack_.

_Kamaji_'s support for Cluster API allows us to use our existing
[`cluster-api-provider-metal-stack`](https://github.com/metal-stack/cluster-api-provider-metal-stack) to provision and
manage _Kamaji_ **tenant clusters** that _Kamaji_ oversees. This allows us to leverage the strengths of both platforms:
_metal-stack_ for bare-metal provisioning and _Kamaji_ for streamlined Kubernetes cluster management.

The architecture looks as follows when you run the
[`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab) with the _Kamaji_
flavor on your local machine: ![Kamaji Architecture Overview](./overview-kamaji.svg)

We launch a [kind](https://kind.sigs.k8s.io/) cluster, which serves as the _Kamaji_ **management cluster**. This cluster
is responsible for running the _Kamaji_ control plane components and managing the lifecycle of **tenant clusters**.

We also have the _metal-stack_ control plane running inside that same kind cluster, connected to a _metal-stack_
partition which is virtually deployed via [containerlab](https://containerlab.dev/). There are two machines in the
partition, just waiting to be provisioned.

The final component is `CAPMS`, the Cluster API Provider for _metal-stack_, which is responsible for provisioning and
managing the **tenant clusters** on _metal-stack_. It interacts with the _metal-stack_ APIs to create and manage the
necessary resources for the **tenant clusters**, after _Kamaji_ has requested them and is also running in the kind
cluster.

## Setup

The setup fits in quite well with our existing
[`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab), since it already has a
lot of the components in place that we need for _Kamaji_:

- A [kind](https://kind.sigs.k8s.io/) cluster to run the _Kamaji_ control plane components on
- A _metal-stack_ partition with machines, waiting to be used as **worker nodes** for the **tenant clusters**
- `cluster-api-provider-metal-stack` to manage the provisioning of **tenant clusters** on _metal-stack_
- Images with ignition support to join machines via `kubeadm` and `kubelet`

Some rewiring was necessary to make the components work together:

### Deploying _Kamaji_

The _Kamaji_ control plane components are deployed into the kind cluster with additional Ansible roles, reproducing the
[_Kamaji_ Kind setup](https://kamaji.clastix.io/getting-started/kamaji-kind/).

### Kamaji as ControlPlaneProvider and CAPMS as InfrastructureProvider

_Kamaji_ is deployed as a `ControlPlaneProvider` in the kind cluster, while `CAPMS` is deployed as an
`InfrastructureProvider`. We set up the providers via
`clusterctl init --control-plane kamaji --infrastructure metal-stack` and configured the necessary RBAC permissions for
_Kamaji_ to be allowed to access the **tenant clusters** via `CAPMS`. As _metal-stack_ is not a supported infrastructure
provider in _Kamaji_ yet, we had to patch the _Kamaji_ provider components to allow for that. The RBAC permissions and
patches will be included in an upcoming _Kamaji_ release, so that _metal-stack_ can be used as an infrastructure
provider out of the box. The `clusterctl init` installs the CAPI-provider, the CAPI kubeadm bootstrap provider, and the
CAPI kubeadm control plane provider, which are all required for the **tenant cluster** provisioning.

### A cluster template for Kamaji tenant clusters

Before we can spawn **tenant clusters** with _Kamaji_, we need to define, how they should be configured. This is done
with a cluster template: The [example template](https://kamaji.clastix.io/cluster-api/control-plane-provider/) needs
some adjustments to work with our setup, leading to a
[custom template](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/config/clusterctl-templates/cluster-template-kamaji-tenant.yaml)
in our [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab) repository.

### Provisioning tenant clusters

With the **management cluster** running and the template in place, we can now generate **tenant cluster** manifests with
`clusterctl generate cluster` and apply them. _Kamaji_ will then take care of provisioning the **tenant clusters** on
_metal-stack_ via `CAPMS`. At least one firewall and worker node are provisioned for each **tenant cluster**, and the
control plane components are deployed as pods in the **management cluster**. The **tenant cluster** control plane is
accessible via an IP address provided by _metal-stack_, and the worker nodes join via CABPK and `kubeadm`.

### Getting tenant clusters up and running

Once the **tenant cluster** provisioning is triggered, _Kamaji_ will manage its lifecycle. For _metal-stack_ deployments
to get fully ready, [`metal-ccm`](https://github.com/metal-stack/metal-ccm) needs to be deployed into the **tenant
cluster**. A CNI-Plugin can then be installed to get the **tenant cluster** fully operational.

## Getting started

Head over to the [`cluster-api-provider-metal-stack`](https://github.com/metal-stack/cluster-api-provider-metal-stack)
and follow the setup instructions in `DEVELOPMENT.md` to try it out yourself.
