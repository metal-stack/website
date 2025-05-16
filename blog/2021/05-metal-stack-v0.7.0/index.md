---
title: metal-stack v0.7.0 🏃
shortDescription: Custom Filesystem Layouts, Firmware Management and more...
watermark: "Blog"
date: 2021-06-15T08:00:00+02:00
description: "With metal-stack v0.7.0 we launched many new features worth to know about. Read the details in this blog article."
authors: [gerrit]
type: "blog"
categories:
  - "Release"
tags:
  - "Release"
  - "Kubernetes"
  - "Gardener"
---

We are continuing our bare-metal journey with the minor release v0.7.0. Along with bug fixes in many places, this release also adds some great new capabilities to metal-stack, which we'd like to introduce to you in this blog post.

<!-- truncate -->

- [Configurable Filesystem Layouts (MEP-8)](#configurable-filesystem-layouts-mep-8)
- [Machine Firmware Management](#machine-firmware-management)
- [Globally Define BMC Passwords](#globally-define-bmc-passwords)
- [Caching Kernels and Boot Images in a Partition](#caching-kernels-and-boot-images-in-a-partition)
- [Extended Hardware Support](#extended-hardware-support)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.7.0).

## Configurable Filesystem Layouts (MEP-8)

Buying hardware is expensive and it is crucial for you to make the best of it. With this feature we tackle your server disks. File system layouts are now dynamically configurable, which allows users to define their own layouts that can be used for machine provisioning.

Before this feature, the [metal-hammer](https://github.com/metal-stack/metal-hammer) came with a limited set of default layouts that were applied to predefined machine sizes. This static mapping was removed completely and every configuration is now fully accessible through the [metal-api](https://github.com/metal-stack/metal-api).

New with this approach is the capability to create [LVM](<https://en.wikipedia.org/wiki/Logical_Volume_Manager_(Linux)>) volume groups and logical volumes. [RAID](https://en.wikipedia.org/wiki/RAID) configurations are possible, too.

To use this feature, there is a completely new set of commands available in [metalctl](https://github.com/metal-stack/metalctl). You can find them beneath the `filesystemlayouts` subcommand. Your most common layouts should be provided through the metal-stack deployment. You can find example layouts for your deployment automation in the mini-lab [here](https://github.com/metal-stack/mini-lab/blob/v0.1.3/inventories/group_vars/control-plane/metal_fsl.yaml) and [here](https://github.com/metal-stack/mini-lab/tree/v0.1.3/inventories/group_vars/examples).

After that you can list your layouts through `metalctl fsl ls`:

```bash
$ metalctl fsl ls
ID                      DESCRIPTION             FILESYSTEMS                     SIZES           IMAGES
medium-firewall         n1 firewall             /          /dev/sda2            n1-medium-x86   firewall *
                                                /var       /dev/sda3                            firewall-ubuntu *
                                                /tmp       tmpfs
                                                /boot/efi  /dev/sda1

default                 default layout          /          /dev/sda2            c1-xlarge-x86   centos >= 7.0.20210801
                                                /tmp       tmpfs                                debian >= 10.0.20210801
                                                /boot/efi  /dev/sda1                            ubuntu >= 20.04.20210801
                                                /var/lib   /dev/csi-lvm/varlib

default-legacy          old default layout      /          /dev/sda2            c1-xlarge-x86   centos < 7.0.20210801
                                                /tmp       tmpfs                                debian < 10.0.20210801
                                                /boot/efi  /dev/sda1                            ubuntu < 20.04.20210801
                                                /var/lib   /dev/sda3

default-firewall        for firewalls not on n1 /          /dev/sda2            c1-xlarge-x86   firewall >= 2.0.20210606
                                                /var       /dev/nvme0n1p1                       firewall-ubuntu >= 2.0.20210606
```

When allocating a machine, an algorithm automatically determines the layout suitable for the machine allocation, depending on the requested machine size and OS image variant. It's also possible for a user to explicitly specify the layout by providing the `--filesystemlayout` flag to the `machine create` command. For every allocation, the metal-api validates that the inventorized hardware specification is compatible with the chosen layout such that you can be sure that your machine allocation will be successful.

As this feature was specified as a Metal Enhancement Proposal (MEP), the entire documentation for this feature can be found in the [docs](https://docs.metal-stack.io/v0.7.0/development/proposals/MEP8/README/).

Kudos to [@majst01](https://github.com/majst01) for contributing the feature.

## Machine Firmware Management

metal-stack strives for full data center automation, even in the deepest layers of your infrastructure. As a metal-stack operator, you can now manage firmware through the metal-stack API and roll out latest firmware updates for BIOS and BMCs through `metalctl`.

To enable this feature, the metal-api needs to be configured with an S3 bucket configuration. Please check out the deployment parametrization [here](https://github.com/metal-stack/metal-roles/tree/v0.5.15/control-plane/roles/metal#metal-api).

After this, you are able to upload firmware images through the `firmware upload` command and list it via `firmware ls`:

```bash
$ metalctl firmware ls
FIRMWARE        VENDOR          BOARD           REVISION
bios            supermicro      X11DPT-B        3.4
bios            supermicro      X11SDV-8C-TP8F  1.4
```

Triggering the firmware update is now as easy as issuing the command `metalctl machine update bios`. The update will be executed through the [metal-core](https://github.com/metal-stack/metal-core), making use of our hardware-abstraction layer [go-hal](https://github.com/metal-stack/go-hal).

Thanks [@kolsa01](https://github.com/kolsa) for this contribution. 😍

## Globally Define BMC Passwords

Accessing the machine's BMC through the management network is crucial for the metal-stack to function properly. Vendors have different approaches to ship passwords for accessing the BMCs. Managing passwords of these components can become a mess.

This feature tries simplify the metal-stack access to your infrastructure by providing an option to configure a common password for an admin IPMI user that gets deployed in-band through the [metal-hammer](https://github.com/metal-stack/metal-hammer) during the machine discovery phase. With this approach, you make sure that the metal-stack can properly manage your machines even when they come with non-uniform passwords from the hardware vendor.

To enable this feature, you have to set `metal_api_bmc_superuser_enabled` in your deployment parameters. Please look up the role documentation [here](https://github.com/metal-stack/metal-roles/tree/v0.5.15/control-plane/roles/metal#metal-api).

## Caching Kernels and Boot Images in a Partition

The [image-cache](https://github.com/metal-stack/metal-image-cache-sync) is an optional component in the metal-stack, but you should for sure deploy it into your partitions. The cache significantly speeds up machine provisioning times by providing a quick line for downloading OS images for your machines.

In addition to OS images, the cache now also supports storing boot kernels and boot initrds (i.e. the metal-hammer) configured for your partitions, decoupling your infrastructure from Github releases assets.

The cache has even some intelligence and you can configure it to only occupy a certain amount of disk space. Latest images can then be downloaded from the cache, outdated images are still possible to be used but they are downloaded from the internet. The cache in action looks like this:

```bash
$ journalctl -lu metal-image-cache-sync
...
{"level":"info","ts":1623753025.251867,"logger":"syncer","caller":"sync/syncer.go:308","msg":"sync plan","amount":21,"cache-size-after-sync":"10.73GiB"}
+------------------------------+----------------------------------------------------------+---------+--------+
|              ID              |                           PATH                           |  SIZE   | ACTION |
+------------------------------+----------------------------------------------------------+---------+--------+
| centos-7.0.20210415          | metal-os/master/centos/7/20210415/img.tar.lz4            | 657.9MB | keep   |
| centos-7.0.20210606          | metal-os/master/centos/7/20210606/img.tar.lz4            | 659.7MB | keep   |
| debian-10.0.20200701         | metal-os/master/debian/10/20200806/img.tar.lz4           | 461.7MB | keep   |
| debian-10.0.20210131         | metal-os/master/debian/10/20210131/img.tar.lz4           | 467MB   | keep   |
| debian-10.0.20210207         | metal-os/master/debian/10/20210207/img.tar.lz4           | 479.2MB | keep   |
| debian-10.0.20210316         | metal-os/master/debian/10/20210316/img.tar.lz4           | 479.7MB | keep   |
| debian-10.0.20210517         | metal-os/master/debian/10/20210517/img.tar.lz4           | 485.9MB | keep   |
| firewall-2.0.20201214        | metal-os/master/firewall/2.0/20201214/img.tar.lz4        | 443.3MB | keep   |
| firewall-2.0.20210131        | metal-os/master/firewall/2.0/20210131/img.tar.lz4        | 445.5MB | keep   |
| firewall-2.0.20210207        | metal-os/master/firewall/2.0/20210207/img.tar.lz4        | 434.2MB | keep   |
| firewall-ubuntu-2.0.20201214 | metal-os/master/firewall/2.0-ubuntu/20201214/img.tar.lz4 | 542.2MB | keep   |
| firewall-ubuntu-2.0.20210131 | metal-os/master/firewall/2.0-ubuntu/20210131/img.tar.lz4 | 547.2MB | keep   |
| firewall-ubuntu-2.0.20210207 | metal-os/master/firewall/2.0-ubuntu/20210207/img.tar.lz4 | 547.2MB | keep   |
| firewall-ubuntu-2.0.20210304 | metal-os/master/firewall/2.0-ubuntu/20210304/img.tar.lz4 | 547.8MB | keep   |
| firewall-ubuntu-2.0.20210316 | metal-os/master/firewall/2.0-ubuntu/20210316/img.tar.lz4 | 578.8MB | keep   |
| firewall-ubuntu-2.0.20210517 | metal-os/master/firewall/2.0-ubuntu/20210517/img.tar.lz4 | 587.6MB | keep   |
| firewall-ubuntu-2.0.20210606 | metal-os/master/firewall/2.0-ubuntu/20210606/img.tar.lz4 | 593.6MB | keep   |
| ubuntu-20.04.20210131        | metal-os/master/ubuntu/20.04/20210131/img.tar.lz4        | 624.2MB | keep   |
| ubuntu-20.04.20210207        | metal-os/master/ubuntu/20.04/20210207/img.tar.lz4        | 624.2MB | keep   |
| ubuntu-20.04.20210316        | metal-os/master/ubuntu/20.04/20210316/img.tar.lz4        | 655.6MB | keep   |
| ubuntu-20.04.20210517        | metal-os/master/ubuntu/20.04/20210517/img.tar.lz4        | 663.7MB | keep   |
+------------------------------+----------------------------------------------------------+---------+--------+
{"level":"info","ts":1623753025.4695091,"logger":"syncer","caller":"sync/syncer.go:308","msg":"sync plan","amount":1,"cache-size-after-sync":"5.782MiB"}
+------------+--------------------------------------------------------------+---------+--------+
|     ID     |                             PATH                             |  SIZE   | ACTION |
+------------+--------------------------------------------------------------+---------+--------+
| 5.10.42-62 | metal-stack/kernel/releases/download/5.10.42-62/metal-kernel | 6.063MB | keep   |
+------------+--------------------------------------------------------------+---------+--------+
+-------+-------------------------------------------------------------------------------+---------+--------+
|  ID   |                                     PATH                                      |  SIZE   | ACTION |
+-------+-------------------------------------------------------------------------------+---------+--------+
| 0.9.0 | metal-stack/metal-hammer/releases/download/v0.9.0/metal-hammer-initrd.img.lz4 | 45.01MB | keep   |
+-------+-------------------------------------------------------------------------------+---------+--------+
{"level":"info","ts":1623753025.7449687,"logger":"syncer","caller":"sync/syncer.go:308","msg":"sync plan","amount":1,"cache-size-after-sync":"42.93MiB"}
{"level":"info","ts":1623753025.745329,"caller":"cmd/main.go:222","msg":"scheduling next sync","at":"2021-06-15 10:40:00 +0000 UTC"}
{"level":"info","ts":1623753076.737936,"caller":"cmd/main.go:311","msg":"serving cache download request","url":"/metal-stack/kernel/releases/download/5.10.42-62/metal-kernel","from":...
{"level":"info","ts":1623753076.8996398,"caller":"cmd/main.go:311","msg":"serving cache download request","url":"/metal-stack/metal-hammer/releases/download/v0.9.0/metal-hammer-initrd.img...
```

If you want to deploy the image-cache to your partitions as well, please check out the [role documentation](https://github.com/metal-stack/metal-roles/tree/v0.5.15/partition/roles/image-cache).

## Extended Hardware Support

We are trying hard to extend supported hardware for metal-stack. We have two new server types in the family that can be used with metal-stack right out of the box:

- Supermicro SuperServer 2029UZ-TN20R25M
- Supermicro Microcloud 5039MD8-H8TNR

You can checkout the list of supported hardware on [this](https://docs.metal-stack.io/stable/overview/hardware/) documentation site.

## More Information

This is only a small extract of what went into our v0.7.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.7.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
