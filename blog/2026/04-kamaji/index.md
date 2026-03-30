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
_Kamaji_ **tenant clusters** on _metal-stack_. You will also gain further insights on how to get started with _Kamaji_
and _metal-stack_ yourself, based on our
[`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab) setup.

## What is _Kamaji_?

<!-- ai -->

[_Kamaji_](https://github.com/clastix/kamaji) is a _Control Plane Manager_ for _Kubernetes_, designed to simplify how
you run and manage Kubernetes clusters. Instead of deploying control-planes on dedicated machines, _Kamaji_ runs them as
pods within a single management cluster, cutting down on operational overhead and costs. It supports multi-tenancy, high
availability, and integrates seamlessly with Cluster API, making it ideal for private clouds, public clouds, bare metal,
and edge computing.

<!-- /ai -->

## Architecture / Setup

> How can _metal-stack_ and _Kamaji_ cooperate?

Our focus is on showcasing how _Kamaji_ can manage Kubernetes clusters on top of _metal-stack_ via
[Cluster API](https://cluster-api.sigs.k8s.io/), rather than running _Kamaji_ itself on _metal-stack_.

_Kamaji_'s support for Cluster API allows us to use our existing
[`cluster-api-provider-metal-stack`](https://github.com/metal-stack/cluster-api-provider-metal-stack) to provision and
manage _Kamaji_ **tenant clusters** that _Kamaji_ oversees. This allows us to leverage the strengths of both platforms:
_metal-stack_ for bare-metal provisioning and _Kamaji_ for streamlined Kubernetes cluster management.

Below you can find an architectural overview over the _Kamaji_ flavor setup inside the
[`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab):

![_Kamaji_ Architecture Overview](./overview-kamaji.svg)

The existing [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab)
[kind](https://kind.sigs.k8s.io/) cluster gets extended, in order to host the _Kamaji_ **management cluster**. The
**management cluster** is responsible for running the _Kamaji_ control-plane components and managing the lifecycle of
**tenant clusters**.

As you might have noticed, _Kamaji_ only provides the control-plane for multiple **tenant clusters** and, therefore,
still needs a running worker nodes provider, in order to task `kubeadm` to bootstrap them. This is why the _metal-stack_
control-plane is still needed. It provides a virtually deployed partition via [containerlab](https://containerlab.dev/)
and two machines, somewhat similar to how the default
[_mini-lab_ sonic flavor](https://github.com/metal-stack/mini-lab?tab=readme-ov-file#flavors) does.

The final component is `CAPMS`, the Cluster API Provider for _metal-stack_, which is responsible for provisioning and
managing the **tenant clusters** on _metal-stack_. It interacts with the _metal-stack_ APIs to create and manage the
necessary resources for the **tenant clusters**, after _Kamaji_ has requested them and is also running in the kind
cluster.

In order to create a working _Kamaji_ flavor showcase in our
[`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab), we had to do some
tinkering and, in the end, rewire the existing components to make them harmonize.

### Deploying _Kamaji_

The _Kamaji_ control-plane components are deployed into the kind cluster with additional Ansible roles, reproducing the
[_Kamaji_ Kind setup](https://kamaji.clastix.io/getting-started/kamaji-kind/).

### _Kamaji_ as ControlPlaneProvider and `CAPMS` as InfrastructureProvider

_Kamaji_ is deployed as a `ControlPlaneProvider` in the [kind](https://kind.sigs.k8s.io/) cluster, while `CAPMS` is
deployed as an `InfrastructureProvider`. We set up the providers via
`clusterctl init --control-plane kamaji --infrastructure metal-stack` and configure the necessary _RBAC_ permissions for
_Kamaji_ to be allowed to access the **tenant clusters** via `CAPMS`. As _metal-stack_ is not a supported infrastructure
provider in _Kamaji_ yet, we had to patch the _Kamaji_ provider components to allow for that. The _RBAC_ permissions and
patches will be included in an upcoming _Kamaji_ release, so that _metal-stack_ can be used as an infrastructure
provider out of the box. The `clusterctl init` installs the _CAPI Provider_, the _Cluster API Bootstrap Provider
Kubeadm_ (`CAPBK`), and the _CAPI kubeadm control plane provider_, which are all required for the **tenant cluster**
provisioning.

### A cluster template for _Kamaji_ tenant clusters

Before we can spawn **tenant clusters** with _Kamaji_, we need to define, how they should be configured. This is done
with a cluster template: The [example template](https://kamaji.clastix.io/cluster-api/control-plane-provider/) needs
some adjustments to work with our setup, leading to a
[custom template](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/config/clusterctl-templates/cluster-template-kamaji-tenant.yaml)
in our [`capi-lab`](https://github.com/metal-stack/cluster-api-provider-metal-stack/tree/main/capi-lab).

### Provisioning tenant clusters

With the **management cluster** running and the template in place, we can now generate **tenant cluster** manifests with
`clusterctl generate cluster` and apply them. _Kamaji_ will then take care of provisioning the **tenant clusters** on
_metal-stack_ via `CAPMS`. At least one firewall and worker node are provisioned for each **tenant cluster**, and the
control-plane components are deployed as pods in the **management cluster**. The **tenant cluster** control-plane is
accessible via an IP address provided by _metal-stack_, and the worker nodes join via `CABPK` and `kubeadm`.

### Getting tenant clusters up and running

Once the **tenant cluster** provisioning is triggered, _Kamaji_ will manage its lifecycle. For _metal-stack_ deployments
to get fully ready, [`metal-ccm`](https://github.com/metal-stack/metal-ccm) needs to be deployed into the **tenant
cluster**. Finally, a CNI-Plugin can be installed to get the **tenant cluster** fully operational.

## Getting started

Head over to the [`cluster-api-provider-metal-stack`](https://github.com/metal-stack/cluster-api-provider-metal-stack)
repository and follow the setup instructions in `DEVELOPMENT.md` to try it out yourself.
