---
slug: /firewalls
title: Firewalls
sidebar_position: 1
---

# Firewalls

Firewalls in metal-stack are machines that connect networks to each other or the internet and allows traffic filtering.

Only firewalls can have multiple networks attached. 

Firewalls do not require specialized hardware. For most scenarios any of your Machine Sizes can be used as a Firewall.

:::important
metal-stack does not support using existing firewall appliances for east-west traffic within metal-stack.

It is technically possible to use an existing firewall appliance to filter north-south traffic.

Nevertheless we encourage you to use metal-stack firewalls for north-south traffic as well to get the benefits of lower TCO due to use of commodity hardware and end-to-end configurability using metal-api.
:::

## Why do we use Machines as Firewalls?

Using machines as firewalls gives us a lot of advantages. Controlling the full software stack running on the firewall gives us a lot of flexibility and enables quicker feature development. Our default [firewall image](https://github.com/metal-stack/metal-images/tree/master/firewall) uses nftables for L4 filtering and [Suricata](https://suricata.io/) for network analysis and threat detection.

### Why not integrate existing firewall appliances?

We see limited benefit in using firewall appliances for the following reasons:

- Firewall appliances are a fragmented product category without vendor-agnostic API or common behaviour
- As a result of the fragmented landscape supporting the most common firewalls would bind development time
- Appliances and bandwidth would be shared between tenants, increasing management complexity and reducing tenant isolation


### Why not use Top-of-Rack Leaf switches as firewalls?

SONiC can provide basic L3/L4 packet filtering capabilities using its ACLs, which can be offloaded to the switching silicon. But unfortunately that is not enough for our requirements:

- Switch ASICs vary widely in supported maximum number of active rules and supported ACL features
- We require NAT, which is not supported when offloading to ASICs
- Going past stateless filtering to stateful tracking requires specialized DPU hardware, increasing cost and reducing accessibility
- We offer Intrusion Detection as a feature, which is also not possible while utilizing offloading
- Using dedicated machines allows us to provide the same great isolation guarantees as with regular machines. If you provision the Firewall, you do not share resources or access with other tenants.

In short, to offer comparable features to our current solution, we would need to disable ASIC offloading and either punt all traffic to either the weak main switch CPU, causing unpredictable performance or use specialized DPUs.

## Creating a Firewall

:::info
TODO: metalctl/metalcli example

TODO: Configuring firewalls via firewall-controller CRDs

https://github.com/metal-stack/website/issues/289
:::

## Firewall Controller

The firewall-controller allows you to configure Firewalls using CRDs from inside of Kubernetes clusters. Firewall configuration provided by the firewall-controller is hot reloaded.


## Lifecycle

Firewall Machines are managed by metal-stack. The local state of Firewall machines is ephemeral, as the authoritative configuration is stored in metal-api. Manual changes to the configuration are not supported and will be overridden. Use metalctl or Firewall CRDs to apply changes to firewall configuration.

## VPN integration

TODO: https://github.com/metal-stack/website/issues/290
