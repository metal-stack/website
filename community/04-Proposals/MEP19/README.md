---
slug: /MEP-19-zone-awareness
title: MEP-19
sidebar_position: 19
---

# Zone Awareness

## Current Situation

Regions and zones are not API entities in metal-stack; they are encoded in partition names, e.g. `fra_eqx_01` for Frankfurt (region), Equinix (zone).

Every partition is a self-contained EVPN fabric. Private node networks are derived from partition-scoped super networks and are not routed between partitions; only external networks such as the internet or a Datacenter Interconnect (DCI) connect partitions. VNIs come from one installation-wide pool in the `metal-api`, so a VNI identifies exactly one network in exactly one partition. Since the multi-tenant metal-apiserver of [MEP-4](../MEP4/README.md), prefixes may overlap across projects but stay disjunct within one project (network namespaces in go-ipam ≥ `v1.12.0`).

Storage systems are deployed per partition, attached to the exit switches, and reached by a machine through its firewall.

## Motivation

A partition can already be spread across data centers with rack spreading ([MEP-12](../MEP12/README.md)), but placement is best-effort and not explicit, and the partition stays one failure domain: a single BGP or EVPN failure can take it down entirely. Like the zones of major cloud providers, zonal distribution across independent partitions improves availability and fault tolerance.

## Goals

1. **Partitions stay separate EVPN failure domains.** No stretched EVPN control plane, no shared route reflectors, no VXLAN data plane spanning partitions: EVPN is terminated at the partition border.
2. **Explicit placement.** Machines of one project can be placed explicitly in several partitions of a region, with a different node CIDR per partition, so the `metal-api` has to model one project's private networks in more than one partition.
3. **Private networks may communicate directly.** Machines of one project in different partitions can be allowed to reach each other over their private networks, without NAT.
4. **Storage is independent in every partition.** Storage traffic never crosses a partition boundary, and the API exposes in which partition a network and its storage live, so that consumers can enforce zone affinity.

## Non-goals

1. Stretching a partition across data centers (rack spreading, metro setups).
2. Cross-region connectivity: all partitions of a region are assumed to have low latency to each other.
3. A storage design; this proposal only states the [requirements on storage](#storage-in-a-zone-aware-setup).

## Terminology

| Term | Meaning |
| :--- | :------ |
| Region | A geographic location, e.g. Frankfurt, with one or more zones. |
| Partition / zone | One EVPN fabric with its own leaves, spines, exit switches and control plane; the failure domain. |
| Exit switch | The switch terminating a partition's EVPN domain towards the outside; storage is attached here. Called `exit` in [MEP-17](../MEP17/README.md). |
| DCI | Data Center Interconnect: the transport between the exits of partitions. |
| Stitched network | One project's private networks in several partitions that are connected to one routed network. In [B1](#b1-srv6-l3vpn-stitching-on-dedicated-gateways) a label on the private networks, in [B3](#b3-transit-vpc-dci) a proposed `metal-api` entity (VPC). |

Part A describes *where the firewall sits* and which traffic it sees; Part B *how private networks are connected* across partitions. Both are largely independent, see [Combining A and B](#combining-a-and-b).

## Part A — Firewall and Traffic Architecture

### A0 Today: One Firewall, No Cross-Partition Private Routing

![today: storage access via the firewall](storage-current.svg)

A private network lives in one partition and has one firewall (or an active/standby pair), attached to the private network and to the external networks. All traffic leaving the private network — internet, DCI and storage — passes the firewall, so its rule set is fully enforced. Storage is a separate VRF; the firewall routes between the tenant VRF and the storage VRF. Egress is SNAT'ed to one public IP; ingress uses external IPs announced via BGP. Simple, fully enforced, cheap — and no zone availability at all.

### A1 Separate Firewall per Partition

![firewall per partition](firewall-per-partition.svg)

Every partition in which the project has machines gets its own firewall with the same rule set. Cross-partition traffic between private networks is routed in the fabric ([Part B](#part-b--connecting-private-networks-across-partitions)) and passes **no firewall**; east-west filtering is left to the machines themselves and to the scoping of the routes in the fabric. Storage stays partition-local and is reached through the local firewall as in A0.

- **Internet.** Each partition has its own uplink and SNAT, so the project has *n* egress IPs. An external IP reachable in several partitions must come from an external network shared across partitions (anycast).
- **Failure behavior.** A partition outage only affects that partition's machines, firewall, storage and uplink; the others keep full north-south connectivity.
- **Required changes.** `metal-api` allows a project's private networks in several partitions; the firewall-controller-manager creates and reconciles one firewall per partition; the firewall-controller handles a node network made of several prefixes.

### A2 Firewall for North-South Traffic Only

![firewall for north-south traffic only](firewall-north-south.svg)

A2 adds to A1 by also taking storage off the firewall: a route-map on the leaf leaks routes between the tenant VRF and the storage VRF per project, and the storage VRF carries the traffic to the storage attached to the exit. The firewall only handles internet traffic, which makes its sizing predictable and decouples storage throughput from it. A single north-south firewall for all partitions is not an option: it would make its partition a shared failure domain again.

- **Security.** No firewall rule applies to cross-partition or storage traffic. Isolation rests on on-machine filtering, the scoping of the route leaks (only the project's own networks) and the storage system's own authentication.
- **Required changes.** Everything from A1, plus `metal-core` programming the tenant ↔ storage route-maps on the leaves for projects with storage access. Leaked storage prefixes must never be redistributed towards the DCI.

### Comparison

| | A0 Today | A1 Firewall per Partition | A2 North-South Only |
| :--- | :--- | :--- | :--- |
| Firewalls per private network | 1 | *n* | *n* |
| Machine ↔ machine cross-zone | not possible | fabric, no firewall | fabric, no firewall |
| Machine → storage | via firewall | via firewall | route-map on the leaf |
| Public egress IPs | 1 | *n* | *n* |
| East-west enforcement | firewall | on-machine + route scope | on-machine + route scope |
| Blast radius of a partition loss | whole private network | one zone | one zone |

## Part B — Connecting Private Networks Across Partitions

All options connect a project's private networks in separate EVPN domains without merging those domains. They differ in what carries the traffic between the partitions and in what they demand from the `metal-api`.

### B1 SRv6 L3VPN Stitching on Dedicated Gateways

![SRv6 L3VPN stitching](dci-srv6.svg)

Each partition gets a pair of **DCI gateways**: dedicated, provider-owned Linux servers attached to both exits. A gateway joins the fabric as an ordinary EVPN VTEP and holds one VRF per stitched network with that network's partition-local VNI. It re-originates the network's EVPN type-5 routes as VPNv4/v6 routes with an SRv6 SID (End.DT46, one per VRF for IPv4 and IPv6); remote gateways import them by route target and announce them as type-5 into their fabric with their own VNI. Between partitions, only plain IPv6 is needed, with one locator prefix per partition and no tenant state. Only layer 3 is stitched.

**Prototype.** The [open-dci](https://github.com/mwindower/open-dci) demonstrator implements this with stock FRR and the Linux kernel and is tested end to end in a containerlab lab in CI: three partitions, two tenants with different VNIs per partition, IPv4 and IPv6, redundant gateway pairs, failure scenarios. It is alpha.

**Stitching from labels.** Tenants opt in by putting the same label value on their private networks in the partitions that should form one network, e.g. `open-dci.io/stitch: prod`. A [`dci-controller`](https://github.com/mwindower/open-dci/blob/main/docs/metal-stack-controller.md) reads the labelled networks from metal-apiserver and configures the gateways accordingly; route targets are derived from project and label value, so no registry is needed and nothing is stitched across projects. Who may stitch follows [MEP-4](../MEP4/README.md)'s project scoping: only users allowed to edit a project's networks can label them.

**Why dedicated gateways.** On the exit switches, VXLAN decapsulation plus SRv6 encapsulation needs ASIC support few switch chips and SONiC platforms offer, every stitched VRF consumes fixed switch tables, and per-tenant state would couple to the fabric. On the tenant firewall — prototyped and dropped — the trust boundary of the SRv6 domain would be under tenant control.

**Constraints.** No VNI change: VNIs, route targets and ASNs stay partition-local and the `metal-api` VNI pool stays as it is. The prefixes of one stitched network must be disjunct ([MEP-4](../MEP4/README.md)). The provider assigns a locator per partition and a loopback per gateway; this is static per partition and can stay outside the `metal-api`. On the platform side the gateways need Linux ≥ 5.14 and a pinned FRR version: FRR 10.5–10.7 keep leaked routes after their withdrawal, which black-holes removed prefixes in every other partition (10.4 is fine). SRv6 adds 48 B per packet, plus 50 B if the transport runs in a dedicated DCI VRF over VXLAN; metal-networker's current 9000 B on bridge and VXLAN devices silently drops full-size packets on that path.

**Failure behavior.** Both gateways of a pair share the locator and SIDs (anycast), so remote partitions do not react to a gateway failure, and no TCP connection breaks. With BFD on every session of gateways and exits, the demonstrator [measured](https://github.com/mwindower/open-dci/blob/main/docs/performance.md) ≤ 0.3 s loss when a gateway loses its links, ~1 s when a gateway or exit hangs (~7 s without BFD), and none for a drained gateway.

**Security.** A SID decapsulates anything addressed to it, so the exits and gateways filter the edge of the SRv6 domain. Tenants are kept apart by route-target filters, per-network prefix allowlists and prefix limits; DCI route targets are stripped before routes enter a fabric.

**Required changes.** None in the `metal-api` or `metal-core`: no new entity, no IPAM change, no VNI change. New are the gateways with open-dci, the `dci-controller` as a separate component, and a static exit configuration in metal-roles that only changes when a partition joins. Optional, for a more native integration ([proposal](https://github.com/mwindower/open-dci/blob/main/docs/metal-stack-proposal.md)): a firewall-like gateway machine role whose base configuration metal-networker renders, and a dedicated stitch entity if quotas or a separate permission for stitching become requirements.

**Trade-offs.** No VNI change, no vendor or ASIC dependency, nothing tenant-specific on exits and core, and a working prototype with measured failover. Stitching needs no `metal-api` change: a label on the private networks and the existing `dci-controller` are enough. In exchange, two gateway servers per partition sit in the path of all cross-zone traffic with software forwarding whose throughput is not yet measured, and the gateways and the controller are new components to operate.

### B2 Broadcom Enterprise SONiC Multi-Site DCI

![multi-site DCI](dci-multisite.svg)

The exits act as multi-site border gateways and re-originate EVPN routes between partitions with themselves as next hop. The control planes stay separate while the same VNI identifies a tenant network end to end — the standard EVPN multi-site design, with split-horizon built in.

**Constraints.** The most invasive API change: a network has to carry the same VNI in every partition it spans, so the `metal-api` must allocate a VNI once per network and reuse it per partition, instead of assuming one network lives in one partition.

**Platform dependency.** The Multi-Site DCI feature of Enterprise SONiC, including licensing — a departure from building on SONiC community and FRR features.

**Required changes.** VNI allocation as above; `metal-core` configures the border gateway role and site IDs on the exits. A side benefit for A1: identical VRFs in every partition make the firewalls' configuration uniform.

### B3 Transit VPC DCI

![transit VPC DCI](dci-transit-vpc.svg)

Each partition keeps its own VNIs. `metal-core` leaks routes between the tenant VRF and a **DCI VRF** on the leaves; the exits exchange the DCI VRF's prefixes over **plain BGP**, without EVPN or VXLAN between them. A **VPC** entity in the `metal-api` groups the private networks to be connected (B1's stitch label could serve the same purpose) and is what the route-leak automation reconciles against.

**Prototype.** A containerlab lab (`dci-lab`) runs three community SONiC exits (SONiC-VS) in a full mesh, each with a tenant VRF and a `VrfDCI` with its own VNIs (10001/10002, 10003/10004, 10005/10006). The exits peer eBGP unnumbered inside `VrfDCI` over plain routed links. Routes are leaked with FRR `import vrf` and a route-map on `source-vrf`: the tenant VRF only imports the aggregate (`10.0.0.0/16 le 24`), the DCI VRF only the machines' node prefixes (`ge 25`), tagged `no-export`. Machines in different partitions reach each other, including a BGP session across the DCI. The lab covers one tenant, IPv4 only, no leaves (machines sit directly on the exits, so the leak runs there), no redundancy or failover, and has no automated tests.

**Constraints.** No VNI change; prefixes within a VPC must be disjunct. No vendor or ASIC dependency and no additional machines.

**Isolation and scale.** A single `VrfDCI` shared by all projects puts every leaked tenant prefix into one routing table: isolation then rests entirely on route filters, and prefixes overlapping across projects ([MEP-4](../MEP4/README.md)) cannot coexist. Keeping projects apart by construction requires one DCI VRF per VPC on every exit, plus one link or sub-interface and BGP session per VPC and exit pair (VRF-lite) — state that grows with VPCs × partitions on the switches.

**Required changes.** The VPC entity and route-leak reconciliation in `metal-core` on leaves and exits, including the per-VPC DCI VRFs and inter-exit sessions.

**Trade-offs.** One mechanism serves cross-zone and storage traffic (A2), and nothing beyond the switches is needed, but the most logic lives in metal-stack itself, per-tenant state lands on every exit, and the prototype is the least tested.

### Comparison

| | B1 SRv6 Stitching | B2 Multi-Site DCI | B3 Transit VPC DCI |
| :--- | :--- | :--- | :--- |
| DCI data plane | SRv6 over plain IPv6 | EVPN re-origination | plain BGP / IP |
| Stitching happens on | gateway servers | exits | leaves and exits |
| VNI constraint change | none | VNI per network, reused per partition | none |
| New API entity | none (label on private networks) | none | VPC |
| Platform dependency | Linux + FRR on gateways | Enterprise SONiC + license | FRR |
| Additional hardware | 2 gateways per partition | none | none |
| Maturity | prototype ([open-dci](https://github.com/mwindower/open-dci)): multi-tenant, IPv4/IPv6, failover measured, driven by metal-apiserver labels | unverified | lab on SONiC-VS: single tenant, IPv4 |
| Scaling limit | gateway throughput (not yet measured) | EVPN routes across sites | VRFs and sessions per VPC on every exit |

### Combining A and B

| | B1 SRv6 | B2 Multi-Site | B3 Transit VPC |
| :--- | :--- | :--- | :--- |
| **A1** Firewall per partition | works; transport invisible to the firewall | works; uniform VRFs simplify firewall config | works |
| **A2** North-south only | works, but needs the leaf route-leak for storage | works, same caveat | natural pair: one route-leak mechanism for cross-zone and storage |

A2's direct storage path is built from the same leaf route-leaking that B3 introduces; with B1 or B2 it has to be built for storage alone.

## Preference

**A1 + B1** is the preferred target.

- **B1** is the only option tested with several tenants, IPv4 and IPv6, redundant gateways and measured failover. It needs no VNI change, no new `metal-api` entity and no vendor or ASIC feature, and it keeps every per-tenant state off the exits and the core, so fabrics and partitions stay decoupled (Goal 1). Tenants opt in with a label on their private networks, which the `dci-controller` already turns into gateway configuration; a dedicated entity can follow if quotas or a separate stitch permission are required. The accepted cost is two gateway servers per partition; their throughput has to be measured before production use.
- **B2** is not preferred because of the vendor and licence dependency and the most invasive VNI change. **B3** puts per-VPC VRFs and sessions on every exit and relies on route filtering for isolation; it remains a fallback if gateway servers are not acceptable and the number of VPCs stays small.
- **A1** before A2: storage keeps today's enforced path through the firewall, and no leaf route-leak automation is needed. A2 follows only if storage throughput through the firewall becomes the bottleneck.

## Storage in a Zone-Aware Setup

A dedicated storage MEP is expected to cover the design itself. Zone awareness requires:

- **Partition-local storage.** Every partition runs its own storage system in its own storage VRF, attached to the exits. Storage traffic never crosses the DCI, not even during failover.
- **Two access paths.** Through the firewall (A0, A1) or via a per-project route-map between tenant and storage VRF on the leaf (A2). Leaked storage routes must never reach the DCI.
- **Affinity in the API.** Resources are either bound to one partition or replicated across all, and the API states which; consumers of a volume stay in its partition.
- **Isolation without a firewall.** On the direct path, isolation rests on the route-leak scope and the storage system's own authentication — both explicit requirements for the storage design.

## Open Questions

- **Egress identity.** *n* firewalls mean *n* egress IPs, depending on the partition. Is that acceptable, or is a stable egress identity per private network required? Sharing one partition's default route over the DCI would re-couple the partitions' internet connectivity.
- **East-west filtering.** Are on-machine filtering and route scoping sufficient, or is an enforcement point for cross-zone traffic required?
- **Gateway capacity (B1).** Throughput and the number of stitched networks per gateway pair are not measured yet. A scale test is the precondition for the [preference](#preference).
- **Stitch lifecycle (B1, B3).** Quotas for stitching and whether a separate permission beyond editing the project's networks ([MEP-4](../MEP4/README.md)) is needed, rejecting conflicting stitches at creation time, and unique route targets across several `metal-api` instances sharing a DCI. For B3 additionally the lifecycle of the VPC entity.
- **Maximum distance between partitions** of a region, particularly for latency-sensitive distributed systems; belongs into the operator documentation.
