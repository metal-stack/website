---
slug: /MEP-20-machine-provisioning-v2
title: MEP-20
sidebar_position: 20
---

# Machine Provisioning V2

:::info
This document is work in progress.
This MEP depends on MEP-4.
:::

When we started with metal-stack, we decided to go full layer-3 for the dataplane for workloads.
But the inventorization and installation process of machines is done in a layer-2 segment with a traditional DHCP/TFTP/PXE approach.
The benefit of this approach is that it does not require manual configuration steps on any of the components in the datacenter.
New servers just need to be turned on, get the metal-hammer booted via DHCP/TFTP/PXE, register at the API, and are ready to use.

But there are downsides with this approach, too.
Most notably:

- Two different network topologies (L2 and L3) in the dataplane often cause issues on the switches when changing between these two configurations, especially on SONiC and the SWSS daemon.
  The switch port of a machine must be reconfigured between these two modes, once a machine changes from registered to installed and back.
- DHCP and TFTP server (pixiecore) is deployed in the management network of a partition.
  Ideally, the entire machine provisioning cycle would use the production infrastructure, while only the BMC and management access uses the management infrastructure.
- Currently, part of the traffic for machine provisioning runs over the management infrastructe, e.g. OS image pulls, which is undesirable as it may cause bottlenecks and impact service availability of metal-stack.

We were searching for a proper solution which can achieve the same convenient and fast solution but within layer-3.

## Requirements

The following requirements must be fulfilled by the proposed solution:

- Clear separation of management and production infrastructure
- Same "no-touch" experience for new servers
- Configurability of metal-hammer version per partition in real time
- Cache of metal-images accessible from metal-hammer inside a partition
- Preserve all existing discovery, hardware detection, and provisioning logic of the metal-hammer
- Secure network when machine reclaim goes wrong with ACLs on the switch to deny a machine access to anything else than the control plane API.
- Per-partition configuration which provisioning mechanism should be used.
  We cannot expect all adopters to have IPv6 support in place which is a hard requirement for the proposed solution.
- metal-image-cache-sync address is also reachable from within the boot vrf and works as before.

### Non-Goals

- Per-machine generation of boot ISOs
- Support both kinds of machine provisioning options — old and new — within a single partition.

## High level Architecture

The main idea is based on three concepts:

- Boot from ISO feature of server BMC firmware which can be configured from remote via redfish.
  Alternatively, configure HTTP-boot instead of mounting the ISO.
- Enable automated IPv6 address acquisition via SLAAC [RFC 4862](https://www.rfc-editor.org/info/rfc4862/) driven by Router Advertisements [RFC 4861](https://rfcinfo.com/rfc-4861/) instead of DHCP.
- IPv6 in a dedicated boot VRF instead of a boot VLAN.

The L3-only boot and registration process can be described as follows:

- Every server must be configured to either boot from ISO or via HTTP-boot.
- There are multiple ways to achieve this configuration (see [Reconfiguration of BMC boot option](#reconfiguration-of-bmc-boot-option)).
- Once the server is powered on, iPXE is booted from the CDROM or HTTP presented from the firmware.
- The metal-core configures switch ports of unallocated machines with a dedicated boot VRF for each partition configured in the metal-apiserver.
- The production interfaces will then acquire a routable IPv6 address in the boot VRF through SLAAC and router advertisement.
  The network must enable the machine to reach the metal-apiserver in the control plane.
- The iPXE ISO must contain a boot configuration which chain loads from a known location a secondary boot configuration.
  To speed up the iPXE startup, the boot.ixpe should disable IPv4 completely as otherwise iPXE will try DHCP first.
  Sample:

  ```ipxe
  #!ipxe
  chain https://v2.metal-stack.dev/boot.ipxe || shell
  ```

Each metal-stack installation requires an individual iPXE ISO with the appropriate boot.ipxe download URL.
The contents of the secondary boot.ipxe will depend on the partition where the request comes from.
The secondary boot.ipxe will then contain the same payload as currently delivered from pixiecore.
This especially contains the configured linux kernel, metal-hammer version, command line.
The service responsible for creating the secondary boot.ipxe will be called `metal-boot`.

![Logical View](./layer-3-logical.drawio.svg)

![Sequence Diagram](./layer-3-sequence.drawio.svg)

From this point onwards, machine provisioning sequence will remain as is.

## Implementation

### Prerequisites

- [x] Ensure iPXE can be packed as ISO image stored in the firmware, booted with DHCP disabled and get a IP with routes from a SLAAC enable switch
- [x] The initial boot.ipxe contains instruction to pull a secondary boot.ipxe which contains kernel, image and cmdline and ipxe chain boots this
- [x] Can iPXE resolve hostnames to IPv6 addresses?
- [ ] How do we configure the boot VRF on the switch
  - [ ] address space per port
  - [ ] ACLs
  - [ ] special VRF type on the metal-core
- [ ] Specify how metal-hammer kernel must be configured to accept IPv6 router advertisements

### Reconfiguration of BMC boot option

As a prerequisite server-bmc interfaces have to be accessible. After initial server deployment BMC passwords were preconfigured at the factory and unknown to metal-stack. For the initial metal-hammer boot, metal-bmc may be extended with a helper command which accepts a list of MAC addresses, usernames and passwords to set a unified password on all BMCs.

Then during its periodical scan of dhcp leases, metal-bmc may check the configured boot option for each machine. If the boot option is set to PXE, then the boot option must be reconfigured to the desired boot option (CDROM/HTTP boot). Boot from disk must result in a noop.

MEP-15 discusses a more advanced method for bootstrapping new servers, however the work involved exceeds the scope of MEP-20.

### metal-boot Component

metal-boot is a new component for metal-stack. metal-boot acts as a first point of contact for a booting machine. It serves the metal-kernel, the metal-hammer and the cmdline, to allow each partition to independently and quickly change release versions without rebuilding boot ISOs. It also serves a token for the machine to access the metal-apiserver.

`metal-boot` is stateless and can be deployed multiple times and listens to the same anycast IPv6 address for redundancy.

### Scope and Placement of the metal-boot service

It is theoretically possible to run metal-boot as a service on the management servers, it is a stated requirement of MEP-20 that a booting machine must not access a partition's management infrastructure. 

Likewise, the metal-image-cache-sync is currently placed on the management-servers. Since placing or proxying the image cache on the switches is not viable, the image cache has to move to a different location. The image cache may either be hosted on a metal-stack provisioned machine, or on a server outside of metal-stack's scope.

metal-boot could be deployed as a service in the control plane. In this case metal-boot would have to identify the partition a request is coming from. For example we could store the global IPv6 prefix range configured for each partition. 

### Services that must support ipv6

| service                |  explanation                                                                                                                                               |
| ---------------------- |  --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| metal-boot             |  `metal-boot` must directly communicate with the ipv6 metal-hammer, so it must support ipv6                                                                |
| metal-hammer           |  `metal-hammer` must configure the it's own interface to use SLAAC                                                                                         |
| metal-image-cache-sync |  Because the images cannot be through the switch, the cache has to be made available to a booting machine with only an ipv6 address                        |
| metal-apiserver        |  metal-hammer no longer configures an IPv4 adress, therefore communication with the apiserver must use IPv6                                                |

## Necessary Changes on Existing Components

This section will summarize what changes are necessary to implement MEP-20 in metal-stack.

### metal-hammer

metal-hammer will need to bring up the physical Interface of the machine it is running on. When using the boot option ip=dhcp the linux kernel fully configures the interface before loading the initrd. metal-hammer should execute the following steps.

- bring up the physical machine interface
- perform SLAAC
- wait for duplicate address detection to complete

metal-hammer can then proceed as before.

### metal-apiserver

The metal-apiserver will need the following changes.

- metal-apiserver currently models the booting state as PXEBooting. This should be updated and an additional boot event added for ISO Boot.
- metal-apiserver will need to store and assign the boot address space. There should be a boot supernet per partition from which per port /64 networks are assigned.
- metal-apiserver will need to assign the new boot network
- _Important_: New servers will no longer be able to boot via PXE and let the metal-hammer set a `metal` and `root` password and store that in the metal-db, instead we must probably pick some of the ideas of the unfinished MEP-15 and allow to store BMC Passwords manually per machine.

### sonic-configdb-utils

sonic-configdb-utils will need to support additional ACL configuration options for ipv6 to prevent east-west traffic between unprovisioned machines. The ruleset is static, so it can be built similarly to the existing CTRLPLANE tables. (permit metal-boot followed by deny all)

### metal-core

metal-core will need to support additional configuration templates for the boot vrf.

metal-core will also need to dynamically bind the boot ACLs to each port.

### metal-bmc

metal-bmc already scans targets periodically to gather information. In addition to gathering information, metal-bmc should enforce the inserted CDROM and boot mode override.

Sample redfish code to upload a boot media can be found at the gofish documentation [Mount Virtual Media](https://pkg.go.dev/github.com/stmcginnis/gofish?utm_source=godoc#example-package-MountVirtualMedia)

### go-hal

go-hal currently does not support the insertion and removal of virtual media.

### pixiecore

pixiecore is superceeded by metal-boot, however pixiecore will still be maintained for legacy deployments. 
