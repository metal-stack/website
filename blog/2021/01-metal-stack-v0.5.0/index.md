---
title: metal-stack v0.5.0
shortDescription: Lightbits Cloud Storage Release
watermark: "Blog"
date: 2021-01-22T08:00:00+02:00
description: "Release v0.5.0 is there and we have a couple of great news to share! 🎉"
authors: [gerrit]
type: "blog"
tags:
  - release
  - storage
  - kubernetes
  - gardener
---

Release v0.5.0 is there and we have a couple of great news to share! 🎉

<!-- truncate -->

This release predominantly contains:

- [Initial support for Lightbits Cloud Storage](#initial-support-for-lightbits-cloud-storage)
- [Partition Image Cache](#partition-image-cache)
- [New Commands for metalctl](#new-commands-for-metalctl)

In case you are a provider and you have question about the new features, feel free to visit our Slack channel and ask. 😄

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.5.0).

## Initial support for Lightbits Cloud Storage

Since the very beginnings of our project we heard your questions regarding how we want to provide persistent storage for our bare-metal fleet. Our usual answer to this question was "sorry, for the time being you are gonna rely on node local storage".

For the consumers of our Gardener-managed Kubernetes clusters this statement was pretty harsh as we offloaded the responsibility for data availability to the user. For stateful applications, users had to replicate data on their own or store their data externally, outside of their Kubernetes clusters. Otherwise, rolling the nodes of the Kubernetes clusters would cause data loss (which happens for example when updating the OS images of the worker groups or updating the Kubernetes minor version).

We have finally found a partner who we think developed a fantastic solution for cloud storage that fits very well to us. The company is called [Lightbits](https://www.lightbitslabs.com/). They offer a highly performant NVMe over TCP storage implementation — yeah, it's proprietary, but pricing is reasonable.

Momentarily, we are in the process of adding dedicated servers to our productive metal-stack partitions. The new servers are going to run LightOS and, of course, we also manage them with metal-stack. So, hardware support for a new server type will follow soon!

As a provider, we put the new storage servers into _private shared networks_. We lately described private shared networks in an enhancement proposal ([MEP-5](https://docs.metal-stack.io/v0.4/development/proposals/MEP5/README/)). They allow users to place their firewalls directly into the partition's (shared) storage network such that the amount of hops to the Lightbits storage cluster is minimal.

> Side Note for providers: We extended the [gardener-extension-provider-metal](https://github.com/metal-stack/gardener-extension-provider-metal), which can now be configured to deploy [duros-controllers](https://github.com/metal-stack/duros-controller) and a [Duros CRD](https://github.com/metal-stack/duros-controller/blob/v0.1.2/api/v1/duros_types.go#L30-L36) into the seed's shoot namespaces. The duros-controller will then reconcile the CRD and deploy Lightbits storage classes into the shoot cluster. It's also gonna take care for creating credentials and proper ACLs at the Lightbits Duros API, such that the storage consumers will have the best possible user experience.

When everything is setup, the consumption of the new storage is simple. The user's cluster firewall has to be placed into the storage network and after cluster reconciliation the new storage classes will appear and be ready to use.

## Partition Image Cache

We've been using it for quite some time already, but the deployment for a partition-local OS image cache is now publicly available for our adopters, too!

Introducing a partition-local cache for machine images brings the following advantages:

- Significantly increase the download speed of OS images and hence shorten the time for provisioning new machines
- Independence from a global image store (the internet)
- Reduce load on the global image store

The image cache is highly-available and falls back to the "global image store" (the internet) on cache misses or cache backend issues.

If you are interested in deploying the cache into your metal-stack partitions, please refer to the role documentation [here](https://github.com/metal-stack/metal-roles/tree/v0.5.1/partition/roles/image-cache).

## New Commands for metalctl

Small but useful commands were added:

- `metalctl machine power pxe <id>` (Editors): Machine boots from PXE on next reboot
- `metalctl machine power disk <id>` (Editors): Machine boots from disk on next reboot
- `metalctl machine rm --remove-from-database <id>` (Admins): Deletes a machine from the database, which can be required for maintenance reasons (replacing a server in a partition and re-using the old switch ports to connect it)
