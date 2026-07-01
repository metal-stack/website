---
slug: /network-segmentation
title: Network Segmentation
sidebar_position: 5
---

# Network Segmentation

metal-stack enforces network segmentation from a single source of truth. Tenants express intent at a high level (a project, a network, a machine allocation), and `metal-api` turns that intent into device-level configuration. The `metal-core` agent on each leaf renders the switch side into interface and FRR configuration, while machines and firewalls derive their own FRR and nftables configuration from the same network model. No segment inside a partition is wired by hand, so the isolation is a property of metal-api's records rather than of an operator remembering to add an ACL.

The records themselves are not maintained by hand. As described under [Inventory Management and Discovery](./04-inventory-management.md), metal-stack fully owns its own inventory. The connection map that pins each machine port to its switch port is [discovered over LLDP](./04-inventory-management.md#physical-inventory) during PXE boot, and metal-api allocates every [prefix, VRF and VNI](./04-inventory-management.md#logical-inventory) itself. Segmentation is therefore derived from facts the platform observed rather than from configuration an operator transcribed, which is what keeps per-port VRF placement, prefix-lists and VNI mappings correct as machines are allocated and freed.

## Segmentation Model

A tenant owns one or more projects, and a project owns one or more private networks. Every [private network](./04-inventory-management.md#logical-inventory) is allocated its own VRF, which maps 1:1 to a VNI in the EVPN/VXLAN overlay. Because each network routes in its own VRF (see [VRF](./01-theory.md#vrf)), no two networks share a routing table, which isolates projects and tenants from one another and lets the same IP ranges be reused across networks without colliding. [Picture 6](./01-theory.md#physical-wiring) illustrates this separation and the VRF termination that happens on the firewall.

From this model metal-stack draws and enforces the following boundaries:

| Boundary | Mechanism | Enforced at |
| :--- | :--- | :--- |
| Project / tenant | VRF + VNI (EVPN/VXLAN) | leaves, firewalls, exit switches (VTEPs) |
| Per machine port | VRF binding + inbound prefix-list route-map + `maximum-prefix` | leaf |
| Unprovisioned machine | PXE VLAN (layer-2) | leaf access port |
| Partition edge / external | numbered BGP + route-leak + ACLs | exit switch / firewall |

The partition edge is the one boundary metal-stack deliberately does not own end to end. Connectivity that leaves the partition (internet egress, a DMZ, storage, or another availability zone) crosses an [external network](./04-inventory-management.md#logical-inventory) and is terminated on the exit switches, which peer with upstream routers using numbered BGP (see [Exit Switch](./01-theory.md#exit-switch)). Those peerings and the underlay base configuration are highly individual and maintained outside the control plane as version-controlled infrastructure-as-code, tracked in git and deployed by CI.

## Defense in Depth

A packet from a tenant machine crosses several independent enforcement layers before it can reach anything, and because each layer is rendered from the same metal-api state they cannot drift out of agreement. Any one of them is sufficient to deny the traffic.

### Routing Isolation (VRFs)

VRFs provide hard layer-3 isolation. A packet in `vrf5417` has no route to a destination in another VRF. Route-leaking between VRFs happens only where it is explicitly configured, and even then it is constrained. On a tenant firewall, `import vrf` installs routes from a foreign VRF, but an `import vrf route-map` plus a prefix-list decide exactly which prefixes may cross (see [Tenant Firewalls](./01-theory.md#tenant-firewalls-evpn-to-the-host) and Listing 9). The default posture is no reachability, and every leak is a named, prefix-scoped exception.

### Route Filtering

The leaf does not trust a machine to police its own announcements. When a machine is allocated to a project, the leaf ports discovered for the machine in the [physical inventory](./04-inventory-management.md#physical-inventory) are bound to its private network's VRF. The machine's BGP session is filtered inbound by a route-map whose prefix-list permits only the prefixes that network may use. A `maximum-prefix` limit bounds how many routes it can announce (see [Leaf Setup](./01-theory.md#leaf-setup)). A machine therefore cannot announce an address outside its allocation or flood the switch with routes. The same fabric constrains firewalls. Per-firewall route-maps filter both the prefixes and the EVPN/VNI routes the leaf advertises to a firewall. A firewall only has access to the networks it is entitled to.

Unprovisioned machines never enter the routed fabric. They are isolated at layer-2 in the PXE VLAN (`vlan4000`, see [PXE Boot Mode](./01-theory.md#pxe-boot-mode)) and are removed from it the moment provisioning finishes, so a half-installed machine can neither reach nor be reached by tenant networks.

### Software-Defined Firewalls

Each firewall is an ordinary bare-metal machine running FRR as an EVPN-to-the-host VTEP, one per group of tenant servers. A firewall is attached to several VRFs at once (the tenant network plus, for example, `vrfInternet`) and enforces inter-network policy by leaking only the permitted routes between them, masquerading tenant source addresses on the way out. Because it sits in the data path of every packet that leaves the tenant network, it is also where stateful packet filtering happens.

On a Kubernetes cluster, the firewall is configured through Kubernetes resources, from inside the cluster itself. The [firewall-controller](../04-Kubernetes/04-firewall-controller-manager.md) watches `ClusterwideNetworkPolicy` (CWNP) custom resources and compiles them into native nftables rules, optionally running Suricata for intrusion detection. Two networks can exchange packets only where a route leak connects their VRFs. What is then allowed, by port, protocol, source and destination, is governed by the CWNP.

Together these layers implement the defense-in-depth posture described in the [security principles](../../06-For%20CISOs/Security/01-principles.md). The result is isolation by default at layer-3, explicit and prefix-scoped exceptions, and stateful policy at the edge of every tenant network.
