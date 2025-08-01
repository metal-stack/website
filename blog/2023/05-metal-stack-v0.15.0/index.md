---
title: metal-stack v0.15.0 ⚖
shortDescription:
watermark: "Blog"
date: 2023-08-23T11:30:00+02:00
description: "Spread machines intelligently in the data center."
authors: [gerrit]
type: "blog"
tags:
  - release
  - kubernetes
  - network
---

metal-stack v0.15.0 implements [MEP-12: Rack Spreading](https://docs.metal-stack.io/stable/development/proposals/MEP12/README/).

<!-- truncate -->

- [Rack Spreading](#rack-spreading)
- [Backup Restore Sidecar Supporting Postgres Upgrades](#backup-restore-sidecar-supporting-postgres-upgrades)
- [Version of metal-core Available Through API](#version-of-metal-core-available-through-api)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.15.0).

## Rack Spreading

Before metal-stack v0.15.0, when creating a machine through the metal-api, the machine was placed randomly inside a partition. The algorithm did not consider spreading machines across different racks and different chassis.

This may lead to the situation that a group of machines (that for example form a cluster) can end up being placed in the same rack and the same chassis. In certain meltdown scenarios like a rack loosing power or chassis meltdown, it is desirable have machines within a project spread across data ceneter racks as best as possible.

So, instead of just randomly deciding the placement of a machine candidate, there is now a placement strategy that distributes machines within the same partition on the available racks evenly. For placement, it is also possible to allocate machines with so called "placement tags", allowing own distribution groups defined by the user. With this release, our Gardener integration already takes this opportunity to spread cluster workers across racks utilizing the cluster ID tag.

This feature was implemented by [@iljarotar](https://github.com/iljarotar). 👏

## Backup Restore Sidecar Supporting Postgres Upgrades

Our solution for automatically backing up and restoring for databases in the metal-stack control plane is now capable of performing Postgres upgrades. The only thing that has to be done is increasing the container image version of Postgres. It does not get simpler than that.

If you haven't heard about the project before, you should definitely take a look at it. It is called [backup-restore-sidecar](https://github.com/metal-stack/backup-restore-sidecar). It helps us out now for years in a way that we do not need to spin our heads around database backups anymore.

The sidecar supports a variety of databases and backup providers and you can use the original container images from the database owners.

Big thank you to [@majst01](https://github.com/majst01) for implementing this great feature.

## Version of metal-core Available Through API

The version of metal-core can now be looked up through `metalctl`:

```bash
❯ m switch ls -o wide
ID                    PARTITION   RACK               OS                 METALCORE            IP             MODE          LAST SYNC   SYNC DURATION   LAST SYNC ERROR
fra-equ01-r01leaf01   fra-equ01   fra-equ01-rack01   Cumulus (3.7.16)   v0.9.1 (1d5e42ea)    10.1.253.130   operational   13s         249ms
fra-equ01-r01leaf02   fra-equ01   fra-equ01-rack01   Cumulus (3.7.16)   v0.9.1 (1d5e42ea)    10.1.253.134   operational   12s         315ms
```

In addition to that, the sync events are now stored in a separate table in the metal-db, speeding up metal-core sync events by a lot. Also, `metalctl` now shows a red dot in case there are sync errors occurring at the moment. Old sync errors are fade out after 7 days.

## More Information

This is only a small extract of what went into our v0.15.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.15.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
