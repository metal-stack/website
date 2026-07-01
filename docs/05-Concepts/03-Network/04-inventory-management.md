---
slug: /inventory-management
title: Inventory Management
sidebar_position: 4
---

# Inventory Management and Discovery

metal-stack does not rely on external inventory files or an external IPAM. Physical resources are discovered by the service that owns each one, and only the leaf switches need a predefined minimal configuration. The address space is managed by metal-api's built-in IPAM (`go-ipam`), scoped to projects and tenants.

## Physical Inventory

The physical inventory is the hardware in a partition. metal-stack discovers the leaf switches, the machines, and the server BMCs automatically. The spine and exit switches are provisioned as static underlay rather than discovered.

### Discovered

**Switches**: Leaf switches are discovered and registered during initial deployment. They ship running the Open Network Install Environment (ONIE), a minimal Linux environment that downloads and installs the SONiC network operating system. After installation the switch pulls a minimal configuration via ZTP to establish basic connectivity. The remaining components are installed via CI. From then on the switch is orchestrated by the `metal-core` container running on it, which registers it with metal-api.

**Machines**: Tenant machines are discovered automatically during PXE boot. pixiecore intercepts the DHCP broadcast and serves metal-hammer via iPXE, which collects the machine's hardware details.

**Server BMCs**: metal-bmc discovers the chassis management controllers by scanning the DHCP leases of the management network and reaching each one over IPMI/Redfish. Many of the [server types supported by metal-stack](/hardware/) are multi-node chassis (such as the Supermicro MicroCloud), so a single BMC can serve several machines rather than mapping one-to-one. Each node is identified when it PXE-boots.

Each component reports its findings to metal-api:

| Resource | Discovered by | Reported fields |
| :--- | :--- | :--- |
| Leaf switch | `metal-core` | Switch ID (hostname), ports (names + MACs), OS vendor + version, metal-core version, management IP, management user |
| Machine | `metal-hammer` | Serial number, RAM, disks, MAC addresses, FRU data, LLDP neighbors (switch chassis + port per NIC) |
| Server BMC | `metal-bmc` | Manufacturer, BIOS version, firmware, power state, chassis UUID |

LLDP is the link between the machine inventory and the switch inventory. metal-hammer reports each NIC's neighbor, and metal-api correlates those against the registered switch ports to build the connection map between switch ports and machine ports. The physical cable layout is therefore discovered during the same boot, never maintained by hand, and it is what drives per-port VRF configuration when a machine is later allocated to a tenant network.

### Ansible Configured

Part of the partition is provisioned declaratively instead of being discovered. This configuration is maintained as version-controlled infrastructure-as-code (Ansible) and rolled out by CI, outside metal-stack's control plane.

**Leaf switches**, although discovered and then dynamically managed, still need a minimal base configuration to bootstrap metal-core, grouped here by purpose:

  - **Identity**: PartitionID, RackID, Name / Description
  - **Network underlay**: ASN (unique per leaf), LoopbackIP, metal-core CIDR (the switch's address in the PXE/provisioning VLAN), SpineUplinks, ManagementGateway
  - **Auth / transport**: HMACKey, GrpcAddress

**Spine and exit switches** are not represented in metal-api's inventory. metal-api tracks only the switches that machines attach to, namely the leaf pair of each rack. Because spines and exits carry no machine ports, they are never registered and never run metal-core. They are configured once as static underlay:

  - **Spines** forward EVPN routes and transport VXLAN between the VTEPs (see [Spine setup](./01-theory.md#spine-setup)). They are not VTEPs themselves and hold no tenant state, so their configuration is uniform and rarely changes.
  - **Exit switches** connect the partition to the outside: they terminate the external network VRF arriving from the firewalls and peer with upstream routers over numbered BGP (see [Exit Switch](./01-theory.md#exit-switch)). The base configuration is templated like the rest, but the upstream peerings are individual and effectively maintained by hand.

## Logical Inventory

Address management is performed by metal-api through its built-in IPAM (`go-ipam`). Each partition has a super network from which the tenant address space is allocated.

How a network can be used follows from its type:

  - **Private** networks are child networks owned by a single project. A child prefix is allocated from the super network and assigned a unique VRF, which maps to a VNI in the EVPN/VXLAN overlay. IP addresses are allocated only within the owning project, and the VRF isolates the network from every other tenant.
  - **Shared** networks are private networks that have been marked as shared so that other projects may allocate IP addresses from them. They cover services that several projects in the partition need to reach while the traffic stays inside the cluster.
  - **External** networks represent connectivity beyond the cluster, such as internet egress, a DMZ or storage. Their IP addresses can be allocated from different projects, they carry destination prefixes that are announced into the tenant VRFs, and traffic leaving through them is usually NATed behind the gateway (IPv4 masquerade).

Every private network, the IP addresses allocated within it, and its VRF belong to a project, which in turn belongs to a tenant. Each network routes in its own VRF (see [VRF](./01-theory.md#vrf)), so the same IP ranges can be reused across networks, and therefore across projects and tenants, without colliding.

The logical inventory has a boundary at the edge of metal-stack's scope. metal-stack manages the underlay (loopbacks, private 4-byte ASNs, the PXE network) and the tenant overlay (VRF/VNI/EVPN) automatically, but it does not discover networks outside its own scope, so a pre-existing range that must not be allocated has to be documented manually. It also does not configure the BGP sessions with upstream providers. Those peerings (numbered BGP at the exit and border switches) are highly individual and are maintained as version-controlled infrastructure-as-code, tracked in git and deployed by CI.
