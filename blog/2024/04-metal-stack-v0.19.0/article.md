---
title: metal-stack v0.19.0 ✂️
shortDescription:
watermark: "Blog"
date: 2024-11-12T10:30:00+01:00
description: "We published metal-stack v0.19.0 with more features for isolated environments. Read on to learn more."
authors: [gerrit]
type: "blog"
tags:
  - release
  - kubernetes
  - network
---

It's been a while since the last minor release of metal-stack. However, under the hood there has been more activity on our repository landscape than ever before. We had many new first-time contributors and we are really happy to see so much participation in our open source project. metal-stack `v0.19.0` contains a huge amount of updates, features and fixes, which you will learn about in this blog article.

<!--truncate -->

1. [Running metal-stack in Offline Environments](#running-metal-stack-in-offline-environments)
1. [Gardener Integration From Version 1.81 to 1.97](#gardener-integration-from-version-1.81-to-1.97)
1. [New Features on Machine Sizes](#new-features-on-machine-sizes)
1. [Encryption of backup-restore-sidecar backups](#encryption-of-backup-restore-sidecar-backups)
1. [Migration From Cumulus to SONiC](#migration-from-cumulus-to-sonic)
1. [Organizing User Memberships Through the masterdata-api](#organizing-user-memberships-through-the-masterdata-api)
1. [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.19.0).

## Running metal-stack in Offline Environments

Our users typically run metal-stack in regulated environments that have certain restrictions on internet connectivity. With our isolated clusters feature introduced in [metal-stack v0.17.0](https://metal-stack.io/blog/2024/02/metal-stack-v0.17.0), we have ensured that machines do not need to ever reach the internet during the machine allocation time. We have now completed the same requirement for machines during their provisioning phase, theoretically allowing metal-stack to run in offline or air-gapped environments.

This has been made possible by providing configuration options for specifying DNS and NTP servers at all necessary locations in a metal-stack installation. Note that the problem of providing your own container registry, DNS provider and NTP servers is not solved by metal-stack and must be done manually. We have only removed hard-coded dependencies on internet resources.

The necessary changes were described in [MEP-14](https://docs.metal-stack.io/stable/development/proposals/MEP14/README/) and implemented by [@simcod](https://github.com/simcod). 👏

## Gardener Integration From Version 1.81 to 1.97

Primarily, metal-stack is designed for provisioning Kubernetes nodes. As a main cluster orchestrator, we recommend using metal-stack along with the power of [Gardener](https://gardener.cloud/). The Gardener project has a biweekly release cycle, which forces our Gardener integrations to be updated, tested and released regularly.

To give you an idea, here is a list of changes that have been made along the way:

- Migration from the cloud-config-downloader to the Gardener Node Agent
- Migration to the new audit extension called [gardener-extension-audit](https://github.com/metal-stack/gardener-extension-audit)
- Firewall auto updates through our [firewall-controller-manager](https://github.com/metal-stack/firewall-controller-manager)
- Offering K8s clusters up to version 1.30
- Updating Calico and Cilium CNI extensions including new configuration options for both of them
  - Calico can now be run "kube-proxyless" utilizing eBPF and Direct Server Return (DSR)
  - Cilium can now leverage its own BGP load balancer capabilities such that MetalLB is not required anymore
- The [gardener-exstension-acl](https://github.com/stackitcloud/gardener-extension-acl) can now be used without static CIDR whitelisting to ensure connectivity between kube-apiserver and kubelets, outgoing source IPs are now dynamically configured

We cannot emphasize enough our respect for the work that goes into the Gardener project, and we are very happy to announce that another Gardener Hackathon will take place in December of this year, in which the metal-stack team will once again participate. We look forward to seeing you all again guys. 😄

## New Features on Machine Sizes

There are two notable new features for machine sizes.

First, it is now supported to match sizes against specific vendors/models of CPUs, GPUs, and disk types. This has been made possible by some improvements to our size matching algorithm in the metal-api, and by extending the hardware detection information reported by metal-hammer.

To match specific hardware, there is now an `identifier` field that can be used with glob pattern matching to select machines by their discovered hardware specifications. This can look like this:

```yaml
- id: n2-medium-x86
  constraints:
  - type: cores
  	identifier: "Intel Xeon Silver*"
    min: 8
    max: 8
  - type: gpu
    min: 4
    max: 4
    identifier: "H100*"
  - type: storage
    identifier: "/dev/nvme*"
    min: "{{ '800GB' | humanfriendly }}"
    max: "{{ '1000GB' | humanfriendly }}"
```

We have also removed the restriction that only certain NVIDIA graphics cards could be used. There is no longer a restriction, so popular models like the H100 are now supported.

Second, we did another iteration on the size reservation API. Starting as an operator only feature, it is now possible to easily pass this feature to higher level APIs more easily. Reservations can now be selected by IDs and are included throughout the API, e.g. reservation counts are included in the partition capacity calculation. This is a nice feature when certain customers want to reserve machines in the datacenter without having to allocate them immediately.

In previous releases of metal-stack, the metal-api attempted to ensure size reservations and rack spreading ([MEP-12](https://docs.metal-stack.io/stable/development/proposals/MEP12/README/)) on a best effort basis. In the case of concurrency, it was possible for the metal-api to make non-ideal decisions for both of these features. Starting with this release, both features are now guaranteed to make the right decision for each allocation by serializing the machine allocations in the metal-api.

## Encryption of backup-restore-sidecar backups

Another mentionable feature for this release is the ability of our [backup-restore-sidecar](https://github.com/metal-stack/backup-restore-sidecar) to encrypt backups before uploading them to a backup provider. The used encryption algorithm for it is AES-256.

This work was implemented by our new colleague [@ostempel](https://github.com/ostempel). Really glad to have you in the team and looking forward to see more soon! 😻

## Migration From Cumulus to SONiC

Initially, metal-stack started with support for Cumulus Linux on network switches. Keep in mind that metal-stack is tightly integrated with the network to minimize management costs, provide the best possible performance, and ensure the availability and scalability of these components. After NVIDIA acquired Cumulus Linux, we decided to migrate our switch infrastructure to SONiC, an open source alternative that works better with metal-stack.

In order to migrate existing environments, we developed special migration commands to simplify the switch migration. It also allows the migration to occur without any downtime to the customer's production workload.

There is now a new command added to [metalctl](https://github.com/metal-stack/metalctl) called `switch migrate`. The general idea behind the migration flow is as follows

- Deploy the new switch through CI and [metal-roles](https://github.com/metal-stack/metal-roles) without connecting the machines.
- The [metal-core](https://github.com/metal-stack/metal-core) will register with the metal-api as a new switch in the rack.
- Now run `metalctl switch migrate` to copy the existing machine connections in the metal-api to the new switch, port mappings will be automatically translated from Cumulus to the SONiC naming scheme if necessary.
- Cables can now be swapped out without downtime, as the machines are dual-connected to two switches by design.

Much of this migration was designed and written by [@iljarotar](https://github.com/iljarotar)! ❤️

## Organizing User Memberships Through the masterdata-api

The birth of [metalstack.cloud](https://metalstack.cloud) - our hosted version of metal-stack - left some traces in our code base. With metalstack.cloud we implemented a multi-tenant API and UI for metal-stack, which required us to implement some user management.

Therefore we added new entities to the [masterdata-api](https://github.com/metal-stack/masterdata-api) called `ProjectMembership` and `TenantMembership`. With these entities it is now possible to create n:n relationships between users and their memberships within organizations and projects.

Check out metalstack.cloud if you haven't already and get a free trial. We host our infrastructure in Germany and are ISO 27001 certified. You can also ask us if you want to set up metalstack on-premises in your own datacenter and we will be happy to support you there if necessary.

## More Information

This is only a small extract of what went into our v0.19.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.19.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
