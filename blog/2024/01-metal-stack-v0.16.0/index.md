---
title: metal-stack v0.16.0 🎆
shortDescription:
watermark: "Blog"
date: 2024-01-11T10:00:00+02:00
description: "The New Year's release contains a ton of updates. Read about it in this blog article."
authors: [gerrit91]
type: "blog"
tags:
  - release
  - kubernetes
  - network
---

Happy New Year everyone! In this post we are gonna present the first metal-stack release of 2024, which is `v0.16.0`. 😺

<!-- truncate -->

- [Machine Size Reservations](#machine-size-reservations)
- [Gardener Compatibility to v1.73](#gardener-compatibility-to-v173)
- [Birth of gardener-extension-audit](#birth-of-gardener-extension-audit)
- [backup-restore-sidecar support for Meilisearch](#backup-restore-sidecar-support-for-meilisearch)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.16.0).

## Machine Size Reservations

When a metal-stack partition runs out of machines some unpleasant scenarios can arise: For example when the operator who maintains the metal-stack infrastructure needs to replace a machine that runs another crucial infrastructure service for the cloud platform. When other users allocated all the available compute resources already, you get stuck as an operator. For these cases it would be great to reserve some spare machines, which other projects cannot allocate. This is now possible with size reservations.

The reservation can now be added to the size entity, which may look like this:

```bash
❯ metalctl size describe n1-medium-x86
---
...
id: n1-medium-x86
labels:
  size.metal-stack.io/cpu-description: 1x Intel(R) Xeon(R) D-2141I CPU @ 2.20GHz
  size.metal-stack.io/drive-description: 960GB NVMe
name: n1-medium-x86
reservations:
- amount: 3
  description: Keep machines for firewall updates
  partitionids:
  - fra-equ01
  projectid: 55a2f43f-d297-4cdf-990d-ff042e001f58
```

This configuration will ensure that three machines of the size `n1-medium-x86` are kept for allocation of project `55a2f43f-d297-4cdf-990d-ff042e001f58` in the partition with the ID `fra-equ01`. There is also the possibility to show an overview over all size reservations:

```bash
❯ metalctl size reservations list
PARTITION   SIZE            TENANT       PROJECT                                PROJECT NAME             USED/AMOUNT   PROJECT ALLOCATIONS
fra-equ01   c1-xlarge-x86   metal-stack  55a2f43f-d297-4cdf-990d-ff042e001f58   gardener-seeds-workers   4/8           4
fra-equ01   n1-medium-x86   metal-stack  55a2f43f-d297-4cdf-990d-ff042e001f58   seed-firewalls           1/2           1
```

## Gardener Compatibility to v1.73

During the lifecycle of the last metal-stack release, we primarily focused on catching up with our Gardener integration. This is tough as we need to cycle through every version, understand the changes for this release and make necessary adjustments to our self-maintained controllers, integration test all our components and finally update our production landscapes with hundreds of Kubernetes clusters to the new version. Within the last four months we were able to catch up 13 minor versions of Gardener, which is a huge step for all platform users enabling support for Kubernetes cluster up to 1.27.

We will continue this effort in order to make all metal-stack users benefit from most up-to-date versions of Gardener and Kubernetes as soon as possible.

## Birth of gardener-extension-audit

During the last [Gardener Hackathon](https://metal-stack.io/blog/2023/11/hack-the-garden/) in Schelklingen we started with a new Gardener extension called [gardener-extension-audit](https://github.com/metal-stack/gardener-extension-audit). As the name already suggests this extension is intended for shipping the audit logs of the shoot's kube-apiserver instances which reside in the Gardener seed cluster. Somehow it seems that within the community everybody started with an own, closed-source solution for this problem. With this extension we want to offer a publicly available solution to tackle the problem of shipping API server audit logs.

The extension deploys a buffering sink based on fluent-bit, which is receiving the audit logs through the webhook configuration from the kube-apiserver instances. From there, audit logs are carried further to a user-configured destination.

The extension is still under development but we already started to use it in our production landscapes as it is way superior to our previous solutions which were directly integrated into the [gardener-extension-provider-metal#](https://github.com/metal-stack/gardener-extension-provider-metal).

## backup-restore-sidecar support for Meilisearch

As our metal-api audit traces are stored in Meilisearch, we extended the support for this database in the [backup-restore-sidecar](https://github.com/metal-stack/backup-restore-sidecar) project. Just like for Postgres, we additionally implemented the `Update` interface, such that updating Meilisearch becomes as easy as deploying the newer container image in the `StatefulSet` definition.

For this to be possible, the backup-restore-sidecar preserves the current version's binary in its data directory. When the sidecar starts up with a newer version of Meilisearch, the sidecar detects the upcoming version mismatch and begins to dump the data with the old preserved binary into the dedicated backup directory. After that it spawns a process with the new database version and restores the dump into it. As soon as the data was migrated to the new version successfully, the actual Meilisearch container will start up and take over the data from there.

Because this project is so important for meltdown scenarios, we now provided integration tests directly inside the project. The tests transparently proof that the entire backup-restore functionality works with every new commit from now on. The tests can be run easily through Go tests against a `kind` cluster. Even the deployment example manifests are now generated through the integration tests to make sure manifests are always up-to-date and can be adopted easily by the community.

## More Information

This is only a small extract of what went into our v0.16.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.16.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
