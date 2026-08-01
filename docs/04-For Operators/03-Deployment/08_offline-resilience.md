---
slug: /deployment/offline-resilience
title: Offline Resilience
sidebar_position: 8
---

# Offline Resilience

It is possible to operate metal-stack without any external network dependencies by integrating your own DNS and NTP configuration into the stack. This is essential for workloads requiring strong independence and reliability: even if the internet uplink fails, your infrastructure remains operational — existing machines suffer no downtime, and new machines can still be provisioned. All you need in place is a DNS and an NTP server reachable from within the partition.

Offline resilience rests on three independent pillars. Configure all three; each one on its own leaves a gap.

## 1. Time — NTP for Provisioning

NTP servers need to be configured for [pixiecore](https://github.com/metal-stack/metal-roles/tree/master/partition/roles/pixiecore) and [metal-hammer](https://github.com/metal-stack/metal-hammer). This is achieved by providing a list of NTP servers through the following Ansible variable of the `pixiecore` role, deployed as part of the [partition](./04_partition.md#management-server-deploy_mgmt_serversyaml):

```yaml
pixiecore_metal_hammer_ntp_servers:
  - ntp1.your-datacenter.example
  - ntp2.your-datacenter.example
```

Under the hood, pixiecore takes the NTP servers and passes them via the `MetalConfig` to the metal-hammer. When booting bare-metal servers, the metal-hammer picks up the servers from the `MetalConfig` and configures itself accordingly.
If no NTP servers are passed along, the following public defaults are used — which is precisely what you want to avoid in an offline-resilient setup:

- `0.de.pool.ntp.org`
- `1.de.pool.ntp.org`
- `2.de.pool.ntp.org`

## 2. Time and Name Resolution — DNS and NTP for Machines

Beyond provisioning, the running machine and firewall images need to be configured with your custom DNS and NTP servers. This is done via the `dnsservers` and `ntpservers` fields of the machine or firewall allocation request.

Defaults can be configured **per partition** and are then applied to all machines and firewalls in that partition, unless the allocation request overrides them. Both `metalctl partition create` and `metalctl machine create` / `metalctl firewall create` accept the corresponding `--dnsservers` and `--ntpservers` flags.

Setting the partition defaults is the recommended approach: it keeps every machine consistent without requiring every consumer — including your [KCLM](../../05-Concepts/04-Kubernetes/01-kclm.md) — to know about it.

## 3. Artifacts — The Image Cache

Machine provisioning pulls the operating system image, the kernel and the metal-hammer from the [global image store](https://images.metal-stack.io). To become independent of it, deploy the [`image-cache` role](https://github.com/metal-stack/metal-roles/tree/master/partition/roles/image-cache) on your management servers. It runs [metal-image-cache-sync](https://github.com/metal-stack/metal-image-cache-sync), which mirrors the images configured in the metal-api — `metal-images`, `metal-kernel` and `metal-hammer` — into the local file system, and falls back to the global image store only on cache misses.

:::warning
For a genuinely offline-capable partition, the fallback to the internet must never be needed. Verify after every image update that the cache holds all images referenced by `metal_api_images` **before** you cut the uplink, and give the cache enough disk space to hold every image version still in use.
:::

## Kubernetes Workloads

The three pillars above make **metal-stack** offline resilient. Kubernetes clusters on top have their own dependency on container registries. For clusters that must be fully decoupled from the internet, combine this chapter with [Isolated Kubernetes Clusters](../../05-Concepts/04-Kubernetes/06-isolated-clusters.md), which mirrors all strictly required container images into a private registry and enforces the network restrictions with `ClusterWideNetworkPolicy` resources.

## Background

This feature set is based on [MEP-14 — Independence from External Sources](/community/MEP-14-independence-from-external-sources).
