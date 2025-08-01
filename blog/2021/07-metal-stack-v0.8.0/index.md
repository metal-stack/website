---
title: metal-stack v0.8.0 🤩
shortDescription: Updates on Gardener, FSLs and machine management
watermark: "Blog"
date: 2021-09-24T08:00:00+02:00
description: "metal-stack v0.8.0 is out. Read the summary of changes in this blog article."
authors: [gerrit]
type: "blog"
tags:
  - release
  - kubernetes
  - gardener
---

metal-stack v0.8.0 has been released and as always, there are many new things to show. 🤩

<!-- truncate -->

- [Gardener 1.19 Compatibility](#gardener-119-compatibility)
- [Improvements on Filesystem Layouts](#improvements-on-filesystem-layouts)
- [Updates on metalctl](#updates-on-metalctl)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.8.0).

## Gardener 1.19 Compatibility

It's a long time since we were able to update our [Gardener](https://gardener.cloud/) dependencies, but finally metal-stack supports running with Gardener 1.19 including the [API Server SNI](https://github.com/gardener/gardener/blob/master/docs/proposals/08-shoot-apiserver-via-sni.md) feature!

### Audit Logging

A lot of effort was put into our solution for audit logging (kudos to [@mreiger](https://github.com/mreiger) 🚀). Even though we are still trying to find more general solutions with Gardener for audit logging, we can offer the following functionalities at the moment, all "toggle-able" through our shoot spec's control plane feature gates:

- Deployment of an [audit-forwarder](https://github.com/metal-stack/audit-forwarder), streaming the API servers audit events directly into the shoot cluster
- Configuration for sending logs directly to Splunk (this needs to be enabled through the controller configuration and can also be reconfigured from a user through a secret in the shoot cluster's `kube-system` namespace)

### Cloud Storage

In addition to the logging features, we are also moving forward with our [duros-controller](https://github.com/metal-stack/duros-controller), which is an operator providing LightOS NVMe/TCP storage by [Lightbits Labs](https://www.lightbitslabs.com/) to our shoot clusters. The operator is now capable of automatic API token renewal, managed resource health checking and it now also defines a proper cleanup and deletion flow.

We will present this storage solution in one of the next Gardener Community Meetings, so please check the #gardener Channel on [Kubernetes' Slack Workspace](https://kubernetes.slack.com/) and keep the date. 🤓

Big shout out to our Israeli friends of Lightbits Labs for helping us bringing this storage solution to production-grade! ❤️

## Improvements on Filesystem Layouts

In the last minor release we introduced FSLs (file system layouts), which allows users to deploy customizable disk layouts for machine provisioning. In this release we also support software RAIDs (managed through [mdadm](https://en.wikipedia.org/wiki/Mdadm)) to be defined in an FSL. This is how a FSL definition may look like:

```yaml
id: raid
description: "raid layout example"
constraints:
  sizes:
    - c1-xlarge-x86
  images:
    debian: "*"
disks:
  - device: "/dev/sda"
    wipeonreinstall: true
    partitions:
      - number: 1
        label: "root"
        size: 0
        gpttype: "8300"
  - device: "/dev/sdb"
    wipeonreinstall: true
    partitions:
      - number: 1
        label: "root"
        size: 0
        gpttype: "8300"
raid:
  - arrayname: "/dev/md0"
    level: 1
    devices:
      - "/dev/sda1"
      - "/dev/sdb1"
    createoptions: ["--metadata", "1.0"]
filesystems:
  - path: "/"
    device: "/dev/md0"
    format: "ext4"
    label: "root"
  - path: "/tmp"
    device: "tmpfs"
    format: "tmpfs"
    mountoptions:
      [
        "defaults",
        "noatime",
        "nosuid",
        "nodev",
        "noexec",
        "mode=1777",
        "size=512M",
      ]
```

The example illustrates how to put a system's root partition on a raid device `/dev/md0`, where a the software RAID 1 is placed on the two disks `/dev/sda` and `/dev/sdb`.

Along with the new RAID capabilities, it is also possible to extend the size of a logical volume to the rest of free space of its volume group. It works in the same way as for disk partitioning by setting the size value to `0`. Here is an example:

```yaml
id: ci-runner
description: ci runner layout
constraints:
  images: {}
  sizes:
    - c1-xlarge-x86
disks:
  - device: /dev/nvme0n1
    partitions: []
    wipeonreinstall: true
  - device: /dev/nvme1n1
    partitions: []
    wipeonreinstall: true
logicalvolumes:
  - lvmtype: striped
    name: root
    size: 0
    volumegroup: vgroot
volumegroups:
  - devices:
      - /dev/nvme0n1
      - /dev/nvme1n1
    name: vgroot
    tags: []
filesystems:
  - createoptions: []
    device: /dev/vgroot/root
    format: ext4
    label: root
    mountoptions: []
    path: /
  - createoptions: []
    device: tmpfs
    format: tmpfs
    label: ""
    mountoptions:
      [
        "defaults",
        "noatime",
        "nosuid",
        "nodev",
        "noexec",
        "mode=1777",
        "size=512M",
      ]
    path: /tmp
```

## Updates on metalctl

The `metalctl machine ipmi` command is now able to show the current power state of a machine, easing the life for metal-stack operators who are managing the machine fleet. By default, the power status is picked up and reported by the [bmc-catcher](https://github.com/metal-stack/bmc-catcher) in a five minute update interval.

In addition to that, the `machine issues` command output was completely refactored. It's more operator-friendly now, allowing issue filtering and showing the lock description (which is the usual way for operators to move a machine out of the available machine pool):

```console
$ m machine issues --omit bmc-no-distinct-ipbmc-without-mac
ID                                  	POWER	LOCK	LOCK REASON                      	STATUS	LAST EVENT    	WHEN   	ISSUES
263d5a00-f10b-11e9-8000-3cecef408994	●    	🔒  	interfaces: Error set link eth...	💀    	PXE Booting   	24d 13h	- the machine is not sending events anymore (liveliness-dead)
                                    	     	    	                                 	      	              	       	- machine has an incomplete lifecycle (↻) (incomplete-cycles)
942a5c00-a77f-11e9-8000-ac1f6bd38c5a	●    	🔒  	CATERR CPU FEHLER                	💀    	Planned Reboot	92d 22h	- the machine is not sending events anymore (liveliness-dead)
00000000-0000-0000-0000-002590b8f968	●    	    	                                 	      	Phoned Home   	3s     	- machine phones home but not allocated (failed-machine-reclaim)
2ca51200-bdfa-11e9-8000-3cecef23002c	●    	    	                                 	      	Phoned Home   	47s    	- machine phones home but not allocated (failed-machine-reclaim)
```

All issues listed through `metalctl machine issues` are now documented in our [docs](https://docs.metal-stack.io/stable/installation/troubleshoot/#Fixing-Machine-Issues). This should make all the issues of this command more understandable and provides ways to resolve these problems adequately.

Also, there is a new command `machine power cycle` which enables users to hard reset a machine through API, using our [go-hal](https://github.com/metal-stack/go-hal) abstraction layer.

## More Information

This is only a small extract of what went into our v0.8.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.8.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
