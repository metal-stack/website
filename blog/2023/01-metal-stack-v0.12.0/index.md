---
title: metal-stack v0.12.0 👮
shortDescription:
watermark: "Blog"
date: 2023-02-17T12:00:00+02:00
description: "The new version comes with API auditing functionality. Read the short summary of changes in this blog article."
authors: [gerrit91]
type: "blog"
categories:
  - "Release"
tags:
  - "Release"
  - "Kubernetes"
---

metal-stack v0.12.0 delivers auditing for the metal-api, which amongst other great additions will be explained in today's release post. And the good news is that we have many minor releases in the pipeline, which will follow very soon. So keep an eye on this blog to watch the progress of our open source project. 😎

<!-- truncate -->

- [MEP-11: API Auditing](#mep-11-api-auditing)
- [IPMI Power Metrics](#ipmi-power-metrics)
- [DNS Based Egress Policies](#dns-based-egress-policies)
- [Lightbits Client-Side Storage Encryption](#lightbits-client-side-storage-encryption)
- [Updates on csi-driver-lvm](#updates-on-csi-driver-lvm)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.12.0).

## MEP-11: API Auditing

From this release on, metal-stack operators can tell who changed API entities at which point in time in the past without the need to enable verbose logging in the metal-api. This addition was proposed in [MEP-11](https://docs.metal-stack.io/stable/development/proposals/MEP11/README/) and implemented by the great [@vknabel](https://github.com/vknabel). 👏

There is a new Ansible role called [auditing-meili](https://github.com/metal-stack/metal-roles/tree/v0.8.0/control-plane/roles/auditing-meili) available for deploying [Meilisearch](https://www.meilisearch.com/) into the metal-stack control plane. Meilisearch is a rather lightweight and fast search engine, which we use for storing audit logs. New flags in the [metal](https://github.com/metal-stack/metal-roles/tree/v0.8.0/control-plane/roles/metal#auditing) role allow to easily point the metal-api to push audit traces into Meilisearch.

By default, all operations that manipulate resources in the metal-db are stored inside the auditing backend. Read operations are not tracked. Along with that, there is a request ID connected to every audit trace that also correlates with log traces of the metal-api. This way, you can easily find the logs relating to the audit trace and vice versa.

The Meilisearch frontend is not automatically exposed through ingress. It's supposed to be accessed through port-forwarding at the time being. Some more additions were already made and hopefully will be implemented soon:

- Automated backup strategy for the auditing backend
- Access to audit traces through `metalctl`
- Maybe support alternative auditing backends and look at immutable databases

## IPMI Power Metrics

To allow users an insight into how much power the bare metal machines in the data center consume, we now export power metrics of a machine as collected by the [metal-bmc](https://github.com/metal-stack/metal-bmc). This can give the operator an interesting estimate of how much power the racks in the data center are using.

The power metrics are visible through metalctl using the `machine ipmi` command:

```
❯ metalctl machine ipmi -o wide --size n1-medium-x86
ID                                     STATUS   POWER     BOARD PART NUMBER   CHASSIS SERIAL    BIOS VERSION   BMC VERSION   SIZE
256b1c00-be6d-11e9-8000-3cecef22b288            ON 45 W   X11SDD-8C-F         C9380AJ02P50085   1.2c           3.74          n1-medium-x86
4175ba00-be7b-11e9-8000-3cecef22f8fc            ON 63 W   X11SDD-8C-F         C9380AJ02P50085   1.2c           3.74          n1-medium-x86
423e2a00-be42-11e9-8000-3cecef22f900            ON 68 W   X11SDD-8C-F         C9380AJ02P50085   1.2c           3.74          n1-medium-x86
48eb9200-be80-11e9-8000-3cecef22fc1a            ON 48 W   X11SDD-8C-F         C9380AJ02P50085   1.2c           3.74          n1-medium-x86
6f440a00-be4d-11e9-8000-3cecef22f91c            ON 50 W   X11SDD-8C-F         C9380AJ02P50085   1.2c           3.74          n1-medium-x86
...
```

Thank you [@majst01](https://github.com/majst01) for adding these interesting information that are often neglected to the API!

An interesting improvement regarding sustainability will ship in one of the next minor releases of metal-stack, too – we are going to shutdown spare waiting machines in the data center to reduce costs. Stay tuned for the next releases where we are gonna present this feature in more detail.

## DNS Based Egress Policies

The DNS based egress policies feature was announced quite a while ago. However, the feature was never merged upstream. Finally, the pull request found its way into the mainline. This big piece of work was added by [@GrigoriyMikhalkin](https://github.com/GrigoriyMikhalkin) (thanks for hanging out for so long) and we are very happy to see it in action in our production environments. 😊

This feature allows defining `ClusterwideNetworkPolicies` with egress targets by DNS name, e.g. with a match pattern like this:

```yaml
apiVersion: metal-stack.io/v1
kind: ClusterwideNetworkPolicy
metadata:
  namespace: firewall
  name: clusterwidenetworkpolicy-fqdn-pattern
spec:
  egress:
  - toFQDNs:
    - matchPattern: *.example
    ports:
    - protocol: UDP
      port: 80
    - protocol: TCP
      port: 80
```

The blog post that explains the concepts behind this feature were described in another blog post. You can find it [here](https://metal-stack.io/blog/2021/06/firewall-controller-dns). Please check out more information in the [firewall-controller](https://github.com/metal-stack/firewall-controller/tree/v1.2.2) repository if you want to utilize this feature.

## Lightbits Client-Side Storage Encryption

The integration of metal-stack with the sophisticated storage solution from [Lightbits](https://www.lightbitslabs.com/) is now getting a long-awaited feature request from our users: Encryption!

The encryption is done on client-side utilizing the well-known disk encryption specification LUKS2. The [duros-controller](https://github.com/metal-stack/duros-controller) can now deploy encrypted storage classes into the user's Kubernetes clusters. From there, a user can provide an encryption secret which will then be used for encrypting the NVMe-powered block device.

Many thanks go out to our friends from Lightbits, who were helping us to bring this feature to our end-users. 🤝

## Updates on csi-driver-lvm

The CSI driver [csi-driver-lvm](https://github.com/metal-stack/csi-driver-lvm) has received a couple of updates lately. In summary, we have:

- A new integration pipeline utilizing kind instead of a VM for testing (allowing to run the integration tests both locally and on standard Github Actions runners)
- The helm chart was finally moved to helm.metal-stack.io and can now be directly consumed from our helm repository
- Alternative FS types allowing file systems like for example `xfs` and `btrfs` instead of `ext4`

Thanks for all external contributors and the general interest from the community that we see in this repository. Your effort was very much apppreciated by our core team! 😄

## More Information

This is only a small extract of what went into our v0.12.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.12.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
