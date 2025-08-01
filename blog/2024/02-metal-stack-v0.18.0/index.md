---
title: metal-stack v0.18.0 🧠
shortDescription:
watermark: "Blog"
date: 2024-05-08T10:30:00+01:00
description: "In metal-stack v0.18.0 we introduced support for servers with GPUs. Read on to learn more."
authors: [gerrit]
type: "blog"
tags:
  - release
  - kubernetes
  - network
---

With the latest rise of Large Language Models (LLMs) and generative AI technologies, we started facing a high demand for providing GPUs through metal-stack. In reaction to this trend, we added support for provisioning servers with graphic cards in metal-stack `v0.18.0`. Our solution for this is presented in this blog article.

<!-- truncate -->

- [Support for Graphic Cards](#support-for-graphic-cards)
- [Switch Port Management](#switch-port-management)
- [Hello Ubuntu 24.04](#hello-ubuntu-2404)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.18.0).

## Support for Graphic Cards

Since ChatGPT everybody talks about AI and is looking for use-cases to utilize GPU-assisted processing in the own data center.

For metal-stack to support GPUs, we enabled the [metal-hammer](https://github.com/metal-stack/metal-hammer) to detect a server's installed graphic cards during machine discovery. The information reported by the metal-hammer for a server with installed graphic card may look like this:

```plain
❯ metactl machine describe cc37651f-a9ec-4b28-808d-2b78f4d4bfde
...
hardware:
  cpu_cores: 32
  cpus:
  - cores: 16
    model: Intel(R) Xeon(R) Gold 6426Y
    threads: 32
    vendor: GenuineIntel
  - cores: 16
    model: Intel(R) Xeon(R) Gold 6426Y
    threads: 32
    vendor: GenuineIntel
  disks:
  - name: /dev/nvme0n1
    size: 1600321314816
  - name: /dev/sda
    size: 240057409536
  gpus:
  - model: AD102GL [RTX 6000 Ada Generation]
    vendor: NVIDIA Corporation
  memory: 274877906944
...
```

This specific hardware configuration of a server type can be matched to a dedicated machine size by the metal-api. For this to happen, the `size` API was extended to contain GPU type constraints. Coming with this release, a matching size can also be generated through `metalctl` (thanks to [@m1kepeter](https://github.com/m1kepeter) for this neat little feature!) using the `size suggest` command:

```plain
❯ metalctl size suggest g1-medium-x86 --machine-id cc37651f-a9ec-4b28-808d-2b78f4d4bfde
---
constraints:
- max: 32
  min: 32
  type: cores
- max: 274877906944
  min: 274877906944
  type: memory
- max: 1840378724352
  min: 1840378724352
  type: storage
- identifier: AD102GL [RTX 6000 Ada Generation]
  max: 1
  min: 1
  type: gpu
id: g1-medium-x86
labels: {}
```

The new `identifier` field also allows glob patterns to allow more variations.

After creating this size in the API, machines registering with the presented hardware configuration are successfully identified as `g1-medium-x86` type servers, ready for being allocated by the users.

In order to further optimize the user-experience, we decided to introduce a new OS image called `debian-nvidia-12`, which is based on our Debian-based operating system image. The new image additionally contains the proprietary graphic cards drivers and the CUDA toolkit from NVIDIA. When using a GPU-typed servers in a Kubernetes cluster, it is still necessary to run the NVIDIA operator in order to utilize the GPUs inside a Pod. However, there is no need to reboot a server before being able to utilize the GPUs inside a container. Further information about this can be found in our documentation [here](https://docs.metal-stack.io/stable/overview/gpu-support/).

Currently we only support the NVIDIA RTX series. It is not possible to have a mixed set of graphic cards inside a server. As soon as we can get our hands on more hardware, we will expand the support for more graphic cards and can probably also relax the constraint for mixed graphic cards inside a server.

This epic was driven by [@majst01](https://github.com/majst01)! 👏

## Switch Port Management

With this metal-stack release it is possible to observe and change the link statuses on a switch through the metal-api. Despite this feature being handy for our own release integration in order to ensure BGP-failover scenarios work properly throughout every metal-stack release, this feature is also beneficial for operators to get a better overview over their switch hardware inside the data center partition.

The new API endpoints can be accessed through the `metalctl switch port` subcommand.

The `describe` command shows the actual state and the desired state for the switch port including the machine that's connected on the switch port:

```bash
❯ metalctl switch port describe fra01-r01leaf01 --port swp1s0
---
actual:
  machine_id: a44d5600-d332-11ec-8000-3cecefcda340
  nic:
    actual: UP
    identifier: ""
    mac: 6c:9c:6a:4e:40:0b
    name: swp1s0
desired:
  actual: UP
  identifier: ""
  mac: 6c:9c:6a:4e:40:0b
  name: swp1s0
```

The switch port can be toggled using the `switch port up` and `switch port down` commands. During the next sync the desired state is reconciled by our controller running on the leaf switch called [metal-core](https://github.com/metal-stack/metal-core).

Unexpected down ports are reflected in the `switch list` and `switch connected-machines` view in order to quickly identify unexpected port states through the CLI.

This feature was developed by one of our original core developers of the metal-stack project, who lately re-joined our team. [@ulrichSchreiner](https://github.com/ulrichSchreiner), we're glad to have you back! 😊

## Hello Ubuntu 24.04

We now provide new worker and firewall images based on the latest version of Ubuntu, which is 24.04 LTS. Please note that the 22.04 will not be maintained any longer.

## More Information

This is only a small extract of what went into our v0.18.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.18.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
