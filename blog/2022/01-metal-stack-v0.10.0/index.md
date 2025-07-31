---
title: metal-stack v0.10.0 🌻
shortDescription:
watermark: "Blog"
date: 2022-06-21T08:00:00+02:00
description: "We just dropped metal-stack v0.10.0. Read the quick summary of changes in this blog article!"
authors: [gerrit91]
type: "blog"
categories:
  - "Release"
tags:
  - "Release"
  - "Kubernetes"
---

Despite hot summer temperatures we have just released metal-stack v0.10.0! 😎

The last minor release was quite some time ago, so it's more than time to present all the improvements we've implemented for this version.

<!-- truncate -->

- [Architectural Improvements](#architectural-improvements)
- [Size Image Constraints](#size-image-constraints)
- [metal-metrics-exporter](#metal-metrics-exporter)
- [Droptailer Logs for Accepted Firewall Connections](#droptailer-logs-for-accepted-firewall-connections)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.10.0).

Have a nice summer! 🌴

## Architectural Improvements

Honestly, leaf switches should focus as much as possible on networking only. In the past we decided to run both the metal-core and pixiecore component directly on the leafs, which puts some additional load on the devices. With this release, we started to shift some functionality that is not strictly required to run on the leaf switches over to the management servers. This way the leaf switches can focus on their most important task: Networking! 😌

For this to happen, we did a complete refactoring of the metal-core repository and entirely removed the server component that was proxying requests from the metal-hammer to the metal-api. Instead, the metal-hammer now directly communicates with the metal-api through gRPC, which fully decouples the machine discovery and allocation procedure from the metal-core.

In addition to that, we decided to move the [pixiecore](https://github.com/danderson/pixiecore) (written by the great Dave Anderson) onto the management servers and setup a DHCP relay on the switches to forward PXE boot requests to the management servers. For this to happen, we created a permanent fork of the pixiecore in the [pixie repository](https://github.com/metal-stack/pixie). It can now also function without the metal-core, too.

_✍ Operators need to adapt their deployment to move the pixiecore component. Please see release notes for further instructions._

## Size Image Constraints

Sometimes, supporting a specific hardware requires specific changes to the target OS image that a user wants to install on a machine. We can now deal with these scenarios and prevent users from installing OS images to unsupported hardware types by configuring size image constraints. They are configured by the operator and can look like this:

```bash
❯ metalctl size imageconstraint list
ID           	NAME         	DESCRIPTION                   	IMAGE          	CONSTRAINT
n1-medium-x86	n1-medium-x86	n1-medium needs recent image  	firewall-ubuntu	>= 2.0.20210912
             	             	to include network card drivers
```

When a user tries to allocate such a machine in combination with an older image, the API will return an error:

```bash
❯ metalctl firewall create --image firewall-ubuntu-2.0.20201126 --size n1-medium-x86 ...
Error: [POST /v1/firewall/allocate][422] allocateFirewall default   given size:n1-medium-x86 with image:firewall-ubuntu-2.0.20201126 does violate image constraint:n1-medium-x86
```

This feature has many equivalents to image constraints on file system layouts, which was introduced in v0.8.0 from the same contributor: Thanks to [@majst01](https://github.com/majst01) for this contribution! ♥

## metal-metrics-exporter

To provide metal-stack specific metrics for monitoring, we have now shifted the related code bits into an individual component called [metal-metrics-exporter](https://github.com/metal-stack/metal-metrics-exporter).

The deployment role will come along with some first publicly available monitoring dashboards soon. It will become available for the mini-lab as well. 😉

The effort all comes down to one specific person: [@mwennrich](https://github.com/mwennrich), thanks!

## Droptailer Logs for Accepted Firewall Connections

_✍ This feature is only available when using metal-stack together with the [Gardener integration](https://docs.metal-stack.io/stable/installation/deployment/#Gardener-with-metal-stack)._

The droptailer can now show accepted connections on the firewall, which is great for observability, auditing and monitoring. The feature can be enabled through the Gardener shoot spec with the field `logAcceptedConnections`. In combination with the firewall-controller v1.1.5, this will forward the following log lines into the cluster:

```bash
...
{"ACTION":"accept","DF":"","DPT":"53","DST":"8.8.8.8","ID":"8263","IN":"vrfxxx","LEN":"73","MAC":"xx:xx:xx:xx:xx:xx","OUT":"vlanxxx","PREC":"0x00","PROTO":"UDP","SPT":"35609","SRC":"x.x.x.x","TOS":"0x00","TTL":"62","timestamp":"2022-06-21 11:08:12 +0000 UTC"}
{"ACTION":"accept","DF":"","DPT":"443","DST":"212.34.89.203","ID":"60899","IN":"vrfxxx","LEN":"60","MAC":"xx:xx:xx:xx:xx:xx","OUT":"vlanxxx","PREC":"0x00","PROTO":"TCP","RES":"0x00","SPT":"36156","SRC":"x.x.x.x","SYN":"","TOS":"0x00","TTL":"62","URGP":"0","WINDOW":"65535","timestamp":"2022-06-21 11:08:12 +0000 UTC"}
{"ACTION":"accept","DF":"","DPT":"53","DST":"8.8.8.8","ID":"58572","IN":"vrfxxx","LEN":"73","MAC":"xx:xx:xx:xx:xx:xx","OUT":"vlanxxx","PREC":"0x00","PROTO":"UDP","SPT":"64505","SRC":"x.x.x.x","TOS":"0x00","TTL":"62","timestamp":"2022-06-21 11:08:14 +0000 UTC"}
{"ACTION":"accept","DF":"","DPT":"53","DST":"8.8.8.8","ID":"26426","IN":"vrfxxx","LEN":"73","MAC":"1e:60:1c:fb:09:b5:f8:8e:a1:f2:2c:53:08:00","OUT":"vlanxxx","PREC":"0x00","PROTO":"UDP","SPT":"49835","SRC":"10.67.144.3","TOS":"0x00","TTL":"62","timestamp":"2022-06-21 11:08:15 +0000 UTC"}
...
```

Thanks a lot to [@mreiger](https://github.com/mreiger) for this addition. 👍

## More Information

This is only a small extract of what went into our v0.10.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.10.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
