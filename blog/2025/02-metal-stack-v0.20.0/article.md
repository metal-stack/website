---
title: metal-stack v0.20.0 💯
shortDescription:
watermark: "Blog"
date: 2025-02-26T10:00:00+01:00
description: "Finally IPv6 made it into the metal-api. This and more interesting features of the latest release can be read in this blog article."
authors: [gerrit91]
type: "blog"
tags:
  - release
  - kubernetes
  - network
---

Admittedly, we planned supporting IPv6 for metal-stack years ago. 😅

As we all know, good things take time, and that time has finally come! In this release, IPv6 addresses can be provisioned to machines through the metal-api. Read on to learn how it works.

<!-- truncate -->

- [Basic IPv6 Support](#basic-ipv6-support)
- [Gardener Support to v1.106](#gardener-support-to-v1106)
- [Audit Backend Based on TimescaleDB](#audit-backend-based-on-timescaledb)
- [metal-core Reporting BGP States](#metal-core-reporting-bgp-states)
- [Relaunch of Cluster API Provider](#relaunch-of-cluster-api-provider)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.20.0).

## Basic IPv6 Support

Back in 2021 we published a [first blog article](https://metal-stack.io/blog/2021/02/ipv6-part1) talking specifically about IPv6. However, work on the topic was frequently interrupted and postponed. As IPv6 has become a recurring track in the Gardener Hackathons, this year we finally gained enough confidence to merge our first version of basic IPv6 support in the [metal-api](https://github.com/metal-stack/metal-api).

A really big bunch of the work was done by [@majst01](https://github.com/majst01), who also wrote the corresponding enhancement proposal [MEP-13](https://docs.metal-stack.io/dev/development/proposals/MEP13/README/). Thanks for the effort and the never-ending will to finish this up. 😌

With the new API, operators can add a list of prefixes containing both IPv4 and IPv6 addresses, which looks like this:

```yaml
---
id: tenant-super-network-mini-lab
name: Project Super Network
description: Super network of all project networks
partitionid: mini-lab
prefixes:
  - 10.0.0.0/16
  - 2001:db8:0:10::/64
defaultchildprefixlength:
  IPv4: 22
  IPv6: 96
privatesuper: true
consumption:
  ipv4:
    available_ips: 65536
    available_prefixes: 16384
    used_ips: 2
    used_prefixes: 0
  ipv6:
    available_ips: 2147483647
    available_prefixes: 2147483647
    used_ips: 1
    used_prefixes: 0
```

Both families have specific default prefix lengths that are used for child network allocation. Also there is dedicated usage reporting per IP address family. The consumption of IPv6 address families is only an approximation, as counting free addresses would otherwise be costly.

By default, `metalctl` users allocating a child network automatically inherit the prefixes from the address families defined by the parent network:

```bash
❯ metalctl network allocate --name my-node-network --partition mini-lab --project 4b9b17c4-2d7c-4190-ae95-dda44e430fa6
---
id: 2d2c0350-3f66-4597-ae97-ef6797232212
name: my-node-network
parentnetworkid: tenant-super-network-mini-lab
partitionid: mini-lab
prefixes:
- 10.0.0.0/22
- 2001:db8:0:10::/96
projectid: 4b9b17c4-2d7c-4190-ae95-dda44e430fa6
vrf: 20
consumption:
  ipv4:
    available_ips: 1024
    available_prefixes: 256
    used_ips: 2
    used_prefixes: 0
  ipv6:
    available_ips: 2147483647
    available_prefixes: 1073741824
    used_ips: 1
    used_prefixes: 0
privatesuper: false
...
```

With the `--addressfamily` flag it is also possible to extract only child prefixes from the given address family. However, this release also introduces the ability for users to create child networks with a custom prefix length, so it is also possible to allocate smaller or larger prefixes.

When an IP address is allocated from a network without explicitly specifying an address family, a user acquires an IPv4 address, unless the network consists only of IPv6 prefixes. In the latter case, a user gets an IPv6 address by default.

```bash
❯ metalctl network ip create --network 2d2c0350-3f66-4597-ae97-ef6797232212 --project 4b9b17c4-2d7c-4190-ae95-dda44e430fa6
---
allocationuuid: 2dde5c08-78b4-4765-9862-c24dc073b64f
ipaddress: 10.0.0.1
networkid: 2d2c0350-3f66-4597-ae97-ef6797232212
projectid: 4b9b17c4-2d7c-4190-ae95-dda44e430fa6
tags: []
type: ephemeral
...
```

Again, the `--addressfamily` flag can be used to explicitly specify the kind of IP address to obtain:

```bash
metalctl network ip create --network 2d2c0350-3f66-4597-ae97-ef6797232212 --project 4b9b17c4-2d7c-4190-ae95-dda44e430fa6 --addressfamily IPv6
---
allocationuuid: 0312f0b7-2a87-460f-95dd-7b67fdfcddd7
ipaddress: 2001:db8:0:10::1
networkid: 2d2c0350-3f66-4597-ae97-ef6797232212
projectid: 4b9b17c4-2d7c-4190-ae95-dda44e430fa6
tags: []
type: ephemeral
```

IPs and networks can be associated with machines and firewalls as usual. In case network IP auto-acquisition is used, a machine or firewall retrieves an IP from all available IP address families of the corresponding network.

At this stage, the implementation works for metal-stack without the integration of the Gardener. These parts will require adaption as well. However, it is required to run Gardener with at least version v1.109 in order to support dual-stack thoroughly.

## Gardener Support to v1.106

With this release, metal-stack supports Gardener to version `v1.106`, which offers shoot clusters running on Kubernetes version 1.31.

In addition to this, the mini-lab release integration now has a new `gardener` flavor, which uses our Gardener deployment role from the [metal-roles](https://github.com/metal-stack/metal-roles) repository. With this flavor, the mini-lab spins up the Gardener Control Plane while the release integration checks that all components are running and report readiness. Shoot creation was not yet tried out but we are keen to support this in the mini-lab for one of the future releases.

One upcoming topic will also be the migration of the Gardener installation using Helm charts to the Gardener Operator. This requires thorough testing and hopefully we can integrate the migration into one of our next releases.

## Audit Backend Based on TimescaleDB

As an alternative to the Meilisearch backend, it is now possible to use [TimescaleDB](https://www.timescale.com/) as the audit backend for the metal-api audit traces. It has useful features like fast inserts and searches in hypertable chunks, data retention and compression. As this is built as an extension to Postgres, we have good experience maintaining this integration and can reuse our integration with the [backup-restore-sidecar](https://github.com/metal-stack/backup-restore-sidecar) including its database update capabilities.

The interface of querying the backend is identical to what it was with Meilisearch. So, users do not feel any difference.

In the future, we plan to offer at one more audit backend for Splunk.

## metal-core Reporting BGP States

In order to keep track of the BGP connections between the leaf switches and the provisioned machines for operators there is now a way to see the connection state directly through the metal-api.

For instance, this can be observed through the `switch connected-machines` command in combination with `-o wide`:

```bash
❯ metalctl switch connected-machines -o wide
ID                                           NIC NAME                           IDENTIFIER   PARTITION   RACK        SIZE           HOSTNAME   PRODUCT SERIAL
leaf01                                                                                       mini-lab    test-rack
├─╴00000000-0000-0000-0000-000000000001      Ethernet0 (BGP:Established(54s))   Eth1/1       mini-lab    test-rack   v1-small-x86   test
└─╴00000000-0000-0000-0000-000000000002      Ethernet1                          Eth1/2       mini-lab    test-rack   v1-small-x86
leaf02                                                                                       mini-lab    test-rack
├─╴00000000-0000-0000-0000-000000000001      Ethernet0 (BGP:Established(58s))   Eth1/1       mini-lab    test-rack   v1-small-x86   test
└─╴00000000-0000-0000-0000-000000000002      Ethernet1                          Eth1/2       mini-lab    test-rack   v1-small-x86
```

Mainly, [@mwennrich](https://github.com/mwennrich) was responsible for this handy addition. Thanks! 🐕

## Relaunch of Cluster API Provider

As time went on, we decided to give our [cluster-api-provider-metal-stack](https://github.com/metal-stack/cluster-api-provider-metal-stack) another try and rebuild it from scratch. So from a broken state we are back: It works again!

Over time, the Cluster API has added experimental support for the ignition file format, which we now use for machine provisioning. We also support installing the provider using `clusterctl`. Commands like `clusterctl move` also work.

The entire solution can be fully developed in the mini-lab, which simulates the entire stack from the API down to the switches and machines.

If you are interested, feel free to check out the local setup of the cluster-api provider by following our [developer guide](https://github.com/metal-stack/cluster-api-provider-metal-stack/blob/main/DEVELOPMENT.md#getting-started-locally).

## More Information

This is only a small extract of what went into our v0.20.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.20.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
