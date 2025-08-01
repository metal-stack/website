---
title: metal-stack v0.17.0 ☔
shortDescription:
watermark: "Blog"
date: 2024-02-08T10:30:00+01:00
description: "In this release metal-stack implemented support for Kubernetes cluster isolation. Read on to learn what this feature is about."
authors: [gerrit91]
type: "blog"
tags:
  - release
  - kubernetes
  - network
---

The `v0.17.0` release presents an interesting feature for users who want to be able to benefit from Kubernetes while having to fulfill strict regulatory requirements. We call this feature cluster isolation. Read on to learn what it is and how it works.

<!-- truncate -->

- [What's Cluster Isolation?](#whats-cluster-isolation)
  - [How Does it Work?](#how-does-it-work)
- [TimescaleDB Update Support for backup-restore-sidecar](#timescaledb-update-support-for-backup-restore-sidecar)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.17.0).

## What's Cluster Isolation?

For certain users it is a strict requirement that servers never face the public internet. In the world of geo-distributed, cloud-driven container workloads this scenario is rarely looked at because usually users assume that applications come from publicly reachable container registries and external services are consumable from inside our Kubernetes cluster at any times, be it DNS, NTP or Let's Encrypt certificate management.

To minimize the burden to move to Kubernetes for those users that require to avoid a connection to the internet as much as possible, we came up with the design for cluster isolation. The solution adds restrictions on external network connectivity to firewalls, effectively preventing the situation that a cluster worker node ever sees a connection to the internet.

### How Does it Work?

This is how it works:

- The new [oci-mirror](https://github.com/metal-stack/oci-mirror) project gives an easy possibility to specify container images that an operator wants to mirror to another registry.
- The operator now provides a private registry, DNS and NTP servers residing inside the data center partition.
- The private container registry contains the minimal set of images required to spin up a Kubernetes worker node (e.g. the Calico CNI images).
- The firewall now drops the entire traffic from the private node network by default as long as the firewall-controller is not connected to its control plane in the seed cluster.
- As soon as the firewall-controller has connected, it opens the connections to the partition-specific container registry, DNS and NTP servers.
- The worker node will then be able bootstrap, the container runtime is configured to pull the mirrored images from the private registry.

From there we offer two different flavors of cluster isolation, one that is called `restricted` and one that is called `forbidden`.

For clusters of type `forbidden` there is no possibility for users to effectively deploy ingress or egress `ClusterwideNetworkPolicy` resources (CWNPs) that would open connections outside of operator-provided network ranges. This way, the operator can prevent connectivity to the internet or other external networks. Also, services of type load balancer do not acquire IP addresses for services to these external networks as the connection to the service is not being allowed by the firewall-controller anyway.

This also implies that the user needs to provide own private registries that reside inside private networks attached to the cluster. Otherwise it is not possible to deploy any applications to the cluster.

For `restricted` clusters, the responsibility is handed over to the user to open up external network connections through CWNPs, which for us is the compromise between a non-isolated cluster (we call this `baseline`) and `forbidden` mode.

With this feature we are starting to deprecate DMZ-clusters as proposed in [MEP-6](https://docs.metal-stack.io/stable/development/proposals/MEP6/README/) and planning to remove the `RestrictEgress` feature gate from our metal-stack shoot specification. The new cluster isolation approach replaces both these ideas from the past.

Full documentation of cluster isolation feature can be found in our [docs](https://docs.metal-stack.io/v0.17/overview/isolated-kubernetes/).

## TimescaleDB Update Support for backup-restore-sidecar

In our landscape we use the [backup-restore-sidecar](https://github.com/metal-stack/backup-restore-sidecar/) in combination with the popular TimescaleDB extension for Postgres. Even though the backup-restore-sidecar already supports easy upgrades for standalone Postgres instances running in Kubernetes, we struggled updating databases that utilize the TimescaleDB extension.

We were able to identify the problems in the upgrade process and can now also support raising Postgres versions for databases that use the TimescaleDB extension. 😇

## More Information

This is only a small extract of what went into our v0.17.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.17.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
