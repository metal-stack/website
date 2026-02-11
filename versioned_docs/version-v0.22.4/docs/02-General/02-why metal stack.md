---
slug: /why-metal-stack
title: Why metal-stack?
sidebar_position: 2
---

# Why metal-stack?

Before we started with our mission to implement the metal-stack, we decided on a couple of key characteristics and constraints that we think are unique in the domain (otherwise we would definitely have chosen an existing solution).

We hope that the following properties appeal to you as well.

## On-Premise

Running on-premises gives you data sovereignty and usually a better price / performance ratio than with hyperscalers — especially the larger you grow your environment. Another benefit of running on-premises is an easier connectivity to existing company networks.

## Fast Provisioning

Provisioning bare metal machines should not feel much different from virtual machines. metal-stack is capable of provisioning servers in less than a minute. The underlying network topology is based on BGP and allows announcing new routes to your host machines in a matter of seconds.

## No-Ops

Part of the metal-stack runs on dedicated switches in your data center. This way, it is possible to automate server inventorization, permanently reconcile network configuration and automatically manage machine lifecycles. Manual configuration is neither required nor wanted.

## Security

Our networking approach was designed for highest standards on security. Also, we enforce firewalling on dedicated tenant firewalls before users can establish connections to other networks than their private tenant network. API authentication and authorization is done with the help of OIDC.

## API driven

The development of metal-stack is strictly API driven and offers self-service to end-users. This approach delivers the highest possible degree of automation, maintainability and performance.

## Ready for Kubernetes

Not only does the metal-stack run smoothly on [Kubernetes](https://kubernetes.io/) (K8s). The major intent of metal-stack has always been to build a scalable machine infrastructure for _Kubernetes as a Service (KaaS)_. In partnership with the open-source project [Gardener](https://gardener.cloud/), we can provision Kubernetes clusters on metal-stack at scale.

From the perspective of the Gardener, the metal-stack is just another cloud provider. The time savings compared to providing machines and Kubernetes by hand are significant. We actually want to be able to compete with offers of public cloud providers, especially regarding speed and usability.

Of course, you can use metal-stack only for machine provisioning as well and just put something else on top of your metal infrastructure.

## Open Source

The metal-stack is open source and free of constraints regarding vendors and third-party products. The stack is completely built on open source products. We have a community actively working on the metal-stack, which can assist you delivering all reasonable features you are gonna need.