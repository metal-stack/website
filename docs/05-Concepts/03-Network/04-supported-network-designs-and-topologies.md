---
slug: /network-designs-and-topologies
title: Multi-Site Network Designs
sidebar_position: 4
---

# Multi-Site Network Designs

metal-stack supports a set of proven network designs, ranging from single partitions to an EVPN fabric stretched across data centers. This page walks through these designs and explains the reasoning behind them.

The fabric fundamentals, including the CLOS underlay, the EVPN/VXLAN overlay, BGP unnumbered, VRF isolation, and MTU handling, are described in detail in the [Networking](./01-theory.md) document. This page builds on that foundation and focuses on the supported multi-partition designs.

## Topology in Brief

At its core, metal-stack deploys a modern data-center network built on a CLOS fabric, with unnumbered BGP providing underlay reachability and EVPN acting as the control plane for the VXLAN overlay. The [Networking](./01-theory.md) document covers the physical wiring and the switch configuration in full. This section gives a short summary.

- **CLOS underlay.** Leaf and spine switches form a leaf-spine fabric with no single point of failure. Machines are dual-attached to two distinct leaf switches, so that a failure of either network interface card or leaf switch is tolerated through BGP multipath and ECMP.
- **EVPN/VXLAN overlay.** Each logical network maps to a unique VXLAN Network Identifier (VNI). EVPN distributes IP reachability through BGP Type-2 and Type-5 routes and enables controller-driven failover without spanning tree.
- **VRF multi-tenancy.** Every tenant network receives its own Virtual Routing and Forwarding instance on every leaf switch, which creates hard Layer 3 isolation between tenant networks. Traffic between VRFs only flows through explicitly configured route leaking.
- **BGP unnumbered.** Underlay peering between leaf and spine switches uses link-local IPv6 next-hops as defined in RFC 5549, which reduces IP address consumption and configuration complexity. Only exit switches use numbered BGP, and only for peering with external routers such as an Internet Service Provider. BGP is the only routing protocol in the fabric, and OSPF and MPLS are not part of the metal-stack design.
- **ECMP.** Equal-Cost Multi-Path routing across spine switches and exit switches provides both load balancing and redundancy. BGP multipath with per-flow hashing keeps stateful flows on a consistent path.

A separate management network provides Layer 2 and Layer 3 connectivity for out-of-band BMC traffic. This management fabric operates independently from the data-plane fabric and follows a CLOS-like topology.

## Supported Designs

A partition is the metal-stack failure domain. All hardware inside a partition shares one network topology, and a partition usually spans a rack or a group of racks. Operators encode a region and a zone into the partition names, even though the metal-api has no dedicated region or zone entities. A zone is a geographic location within a region, usually in a separate fire compartment. The patterns below describe how partitions relate across zones and sites, each with different trade-offs regarding EVPN stretching, failure isolation, and cross-zone connectivity.

### Design 1 - Independent Partitions (Zone Isolation)

This is the default and most common pattern. Each zone hosts its own metal-stack partition, and partitions are fully independent.

No EVPN or VXLAN overlay is stretched between zones. Each partition operates a self-contained CLOS fabric with its own VNI space, BGP underlay, and exit switches. Private networks are allocated within exactly one partition, so a project that spans multiple zones receives a distinct private network per zone. All inter-zone communication is routed at Layer 3 across the exit switches, which exchange routes with external routing domains.

Partitions share no network state. Failure isolation is strict, and even the complete loss of one partition leaves the remaining zones unaffected. In return, cross-zone redundancy must be implemented at the application layer. Stateless services can be announced from multiple zones via anycast addresses, while stateful services require replication or state persistence outside a single zone.

### Design 2 - Metro Setup (Stretched EVPN)

The EVPN fabric is stretched across multiple data-center locations, forming a single partition.

A single VXLAN overlay spans all zones, which share one VRF and VNI space. Each zone hosts its own leaf switches, and the zones are interconnected at the spine or exit-switch level. The validated design covers three data centers whose interconnect forms a ring, which for three sites is equivalent to a full mesh. Interconnect topologies for more than three data centers are not defined. All data centers must lie within 20 km of each other, with latency below 1 ms, and all transport links must carry jumbo frames (MTU 9216) for VXLAN encapsulation.

The metro forms one partition and therefore one failure domain. A single set of exit switches and one metal-stack control plane govern the entire setup, and overlay state is shared across all zones. In return, services see a single partition and require no application-level awareness of zones. Stateful workloads can span zones without replication at the application layer.

### Design 3 - Zone Aware Setup (Roadmap)

This design targets a middle ground between independent partitions and the metro setup. Multiple independent partitions exist in different locations and EVPN is not stretched between them. Instead, the exit switches interconnect selected VNIs across partition boundaries, for example via EVPN Multi-Site DCI or SRv6. A private network in one partition thereby becomes reachable from another partition without traversing external networks.

Fabric and control-plane failure isolation remain as strict as with independent partitions, because no overlay state is shared between the fabrics. Stateful workloads gain cross-zone connectivity within their private networks, without the latency requirements of a stretched metro. This design is on the roadmap and not yet implemented.

### Transport Assumptions

The feasibility of each multi-site pattern depends on documented transport assumptions.

| Parameter | Independent Partitions | Metro Setup |
|---|---|---|
| Site-internal latency | < 1 ms | < 1 ms |
| Inter-zone latency | < 20 ms | < 1 ms |
| Underlay MTU | 9216 (jumbo frames) | 9216 (jumbo frames) |
| BGP convergence | < 5 seconds | < 5 seconds |
| Failure detection | BGP hold timer (1s/3s) | BGP hold timer (1s/3s) |

## Design Trade-offs Summary

Each multi-site pattern involves trade-offs between isolation, service complexity, and operational requirements.

| Pattern | Failure Isolation | Service Complexity | Latency Requirement |
|---|---|---|---|
| Independent Partitions | Strong | Requires cross-zone awareness | < 20 ms inter-zone |
| Metro Setup | Partial | Transparent, no service changes | < 1 ms between all data centers |
| Zone Aware (roadmap) | Strong | Transparent within interconnected private networks | TBD |

Independent Partitions provides the strongest failure isolation and full autonomy at the cost of requiring services to handle cross-zone anycast routing explicitly. This is the recommended default pattern. Metro Setup provides transparent cross-zone VNI connectivity with no service changes needed, but it shares overlay state across zones and requires strict latency and the validated three-data-center interconnect.
