---
slug: /MEP-19-zone-awareness
title: MEP-19
sidebar_position: 19
---

# Zone Awareness in metal-stack.io

In metal-stack, the concepts of regions and zones are currently represented implicitly through partition names rather than as dedicated API entities. This design uses naming conventions to encode both region and zone information within a partition identifier. For example, the partition name `fra_eqx_01` translates to Frankfurt (region), Equinix (zone), and 01 (partition).

From a networking perspective, traffic between private node networks is not routed between partitions. To prevent misconfiguration, private networks are derived from partition-scoped `supernetworks`, preventing private node networks to be used across different partitions. Only external networks such as the Internet or MPLS connections can be used to route traffic between partitions. 

Additionally, all networks have disjunct IP prefixes. With the introduction of [MEP-4](../MEP4/README.md), this behavior will change: Network prefixes may overlap across partitions but must remain disjunct within a single project. This is possible since go-ipam release `v1.12.0`, which introduced the concept of network namespaces.

## Motivation

With [MEP-12](../MEP12/README.md) the rack spreading feature has been introduced. Limitations of this feature are: It can not be explicitly decided, in which racks nodes are placed. Moreover, this is performed with a best-effort strategy. If no machine is available in one rack, it might get placed in the one where already a machine is present.

Another issue with this approach is that the single partition is still one failure domain, e.g. a single BGP failure could bring down the whole partition. As known from major cloud providers, zonal distribution of workload enhances availability and fault tolerance.

## Requirements to Achieve this Goal

To support explicit region and zone concepts in metal-stack, several functional and architectural requirements must be met. The following considerations focus primarily on the Kubernetes integration and cluster topology aspects:
- Proper spreading of worker nodes and control plane components across [multiple zones](https://kubernetes.io/docs/setup/best-practices/multiple-zones/) and regions must be possible.
- Nodes that belong to the same Kubernetes cluster must have the capability to communicate directly with each other, even if they are located in different partitions, provided that network configurations allow this communication using their respective Node CIDRs.
- It must be possible for nodes within a single Kubernetes cluster to use different Node CIDR ranges, depending on their partition or zone assignment. Major cloud providers use node groups to configure Node CIRDs differently.
- Zones stay separate failure domains (e.g. a failure in the EVPN control-plane of one zone should not affect the other to avoid EVPN fate-sharing)

## Criteria
- Number of hops: for communication btw. worker nodes, to the internet and to the storage.

Storage resources must either be strictly located in a single partition or replicated across all partitions. This can be enforced using [`allowedTopologies`](https://kubernetes.io/docs/concepts/storage/storage-classes/#allowed-topologies) within a StorageClass.

An open design question remains regarding Pod and Service CIDRs. Should overlay networks be avoided and purely relied on routed IPv6? Or should an overlay network be introduced across partitions? Further evaluation is needed to determine the optimal approach.

## Proposals

**Proposal 1: Disjunct VNIs Across Partitions**

![proposal 1](proposal-1.svg)

In this approach, each partition uses a distinct set of VNIs. An additional controller, most likely running on the exit switch, would be required to build and manage the corresponding route maps.

Each partition would maintain its own VRF. On the exit switch, routes from all VRFs associated with the same project would be imported to enable project-wide routing between partitions while maintaining isolation from other projects.

The firewall would need to participate in all VRFs of the cluster, ensuring consistent traffic filtering and policy enforcement across partitions. Additionally, a default route must be present within each VRF.

**Proposal 2: Multi-Site DCI**

![proposal 2](proposal-2.svg)

In the second approach, the same VNIs are used across multiple partitions. This capability can be realized by leveraging features provided by the Enterprise Switch OS.

From a metal-stack perspective, each partition would still define separate node networks, but the same VRFs would be available in each partition.

To support this, the `metal-api` would need to be extended to allow identical VNIs across different networks and partitions, as long as they belong to the same project.

**Storage**

Storage aspects will likely be addressed in a dedicated MEP. However, some initial considerations are outlined here.

![current storage situation](storage-current.svg)

In the current architecture as illustrated above, a node accesses storage through the firewall.

![storage proposal](storage-proposal.svg)

One possible improvement would be to remove the dependency on the firewall for storage access. This could be achieved by configuring a route map on the leaf switch to establish a direct mapping between the tenant VRF and the storage VRF on a per-project basis.

**Proposal 3: Project-Wide Route-Leaking and Open DCI**
This is a mixture of proposal 1 and 2 with disjunct VNIs across partitions.

In this approach, each partition uses a distinct set of VNIs. The `metal-core`, running on the leaf switches, would be required to build and manage route leaks:
- from certain private networks (e.g. all project networks, storage network) to the local VRF (only locally held at the leaf switches)
- from the local VRF to a DCI VRF (only propagated zone-wide)

The open DCI is a ring of exit switches speaking plain BGP (no EVPN routes, no VXLAN) for exchanging the private supernetworks of zones (note: prefix length is longer).
They operate as VTEP for the DCI VRF and is not dependent on the Multi-Site DCI feature of Enterprise SONiC.

Notes:
- cross-zone traffic is very efficiently transported, as the firewall is not in the path (fewer hops)
- this can also be used to provide worker nodes with an more efficient way to access storage systems (also not going through the firewall)

## Operational Recommendations and Documentation Notes

Include a recommendation on the maximum practical distance between partitions within a single zone, particularly with regard to latency-sensitive components such as `etcd`.

## Roadmap

The following tasks can be considered as next steps:

- Verify proposals in containerlab
- Research: Can FRR do the Multi-Site DCI Feature out-of-the-box?
- Create sample for a Gardener shoot spec and the Cluster API manifests
