---
title: metal-stack v0.14.0 🦔
shortDescription:
watermark: "Blog"
date: 2023-07-04T11:30:00+02:00
description: "metal-stack is now officially supporting SONiC switch os."
authors: [gerrit91]
type: "blog"
tags:
  - release
  - kubernetes
  - network
---

In metal-stack v0.14.0 we have added support for [SONiC](https://sonicfoundation.dev/), the operating system for the switches in a metal-stack managed data center.

<!-- truncate -->

- [Introducing SONiC](#introducing-sonic)
  - [Operations](#operations)
- [Summary of Further Additions](#summary-of-further-additions)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.14.0).

## Introducing SONiC

Until today we have been driving the switch infrastructure of metal-stack with an operating system called [Cumulus Linux](https://en.wikipedia.org/wiki/Cumulus_Networks#Cumulus_Linux). And we were very satisfied with it. However, as Cumulus Networks was acquired by Nvidia, Cumulus Linux [is being discontinued for Broadcom-based switches](https://docs.nvidia.com/networking-ethernet-software/cumulus-linux-44/Whats-New/#unsupported-platforms). Hence, starting from Cumulus Linux 5, [only support for Spectrum-based switches will continue](https://docs.nvidia.com/networking-ethernet-software/cumulus-linux-50/Whats-New/#platforms), which unfortunately requires us to migrate away from the OS.

As open source is in the nature of metal-stack, the decision for the replacement fell on SONiC. SONiC was originally created by Microsoft, open sourced in 2016, and is today governed by the Linux Foundation. The OS is based on Debian and supports a wide array of devices and platforms, such that we can open up for a wider compatibility with metal-stack.

Similar to Cumulus Linux, SONiC also utilizes [FRR](https://frrouting.org/) as a routing daemon, such that it was possible to re-use our existing configurations (as applied by [metal-core](https://github.com/metal-stack/metal-core), a small metal-stack component running on the leaf switches).

The entire task was described in enhancement proposal [MEP-10](https://github.com/metal-stack/docs/pull/106).

A big shoutout to everyone who contributed to this huge shift in technology! Key players were [@mwindower](https://github.com/mwindower), [@GrigoriyMikhalkin](https://github.com/GrigoriyMikhalkin), [@robertvolkmann](https://github.com/robertvolkmann),[@majst01](https://github.com/majst01), [@mwennrich](https://github.com/mwennrich) and [@mreiger](https://github.com/mreiger). You rock! 🙂

### Operations

For deploying SONiC-based switches, the [metal-roles](https://github.com/metal-stack/metal-roles) repository now contains a [sonic role](https://github.com/metal-stack/metal-roles/tree/v0.8.15/partition/roles/sonic). As the role comes with a lot of configuration options, it is suitable for deploying leafs, spines and exit switches. Components like the `metal-core` will automatically be configured for SONiC when getting deployed as the Ansible playbooks will automatically detect the underlying switch OS.

After the deployment, in `metalctl` you will be able to see the switch OS now (with a 🐢 indicating Cumulus Linux and a 🦔 indicating SONiC):

```bash
❯ m switch ls
ID                     PARTITION    RACK                OS   STATUS
fel-wps101-leaf01      fel-wps101   fel-wps101-rack01   🐢    ●
fel-wps101-leaf02      fel-wps101   fel-wps101-rack01   🐢    ●
n2-tm1601-r01leaf01    n2-tm1601    n2-tm16-rack01      🦔    ●
n2-tm1601-r01leaf02    n2-tm1601    n2-tm16-rack01      🦔    ●
❯ m switch ls -o wide
ID                     PARTITION    RACK                OS                                                  IP              MODE          LAST SYNC   SYNC DURATION   LAST SYNC ERROR
fel-wps101-leaf01      fel-wps101   fel-wps101-rack01   Cumulus/3.7.15                                      10.5.253.130    operational   6s          1.149s          12d 13h ago
fel-wps101-leaf02      fel-wps101   fel-wps101-rack01   Cumulus/3.7.15                                      10.5.253.134    operational   2s          1.053s          25d 17h ago
n2-tm1601-r01leaf01    n2-tm1601    n2-tm16-rack01      SONiC/Edgecore-SONiC_20230505_014148_ec202111_386   10.11.253.130   operational   1s          316ms           10m 31s ago
n2-tm1601-r01leaf02    n2-tm1601    n2-tm16-rack01      SONiC/Edgecore-SONiC_20230505_014148_ec202111_386   10.11.253.134   operational   6s          387ms           30m 6s ago
...
```

## Summary of Further Additions

In this release we also announce:

- The support of Debian 12 as an OS image for Kubernetes worker nodes. Checkout [metal-images](https://github.com/metal-stack/metal-images/releases) for further release information.
- A row of `metalctl` improvements were introduced:
  - Searching the audit traces with `audit ls`.
  - Creation, update and deletion through file with `-f`.
  - Choices between bulk print and individual print during bulk operations like `apply -f` including interactive security prompts.
- Support for Gardener v1.53, including SSH key rotation on workers and the firewall.
- Performance improvements for the [metal-ccm](https://github.com/metal-stack/metal-ccm), drastically decreasing traffic on the metal-api

## More Information

This is only a small extract of what went into our v0.14.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.14.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
