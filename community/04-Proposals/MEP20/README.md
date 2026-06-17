---
slug: /MEP-20-full-layer-3-dataplane
title: MEP-20
sidebar_position: 20
---

# Full Layer 3

:::info
This document is work in progress.
:::

When we started with metal-stack, we decided to go full layer-3 for the dataplane for workloads. But the inventorization and installation process is done in a layer-2 segment with a traditional DHCP/TFTP/PXE approach.

This works well, does not require manual configuration steps on any of the components in the datacenter. New servers just need to be turned on and get the metal-hammer booted via DHCP/TFTP/PXE and get registered and are ready to use.

But there are downsides with this approach. Most notable:

- 2 different network topologies (L2 and L3) in the dataplane
- The switch port of a machine must be reconfigured between these two modes, once a machine changes from registered to installed and back.
- dhcp and tftp server is deployed in the management network of a partition. Connecting these services to a L2 segment on the leaf switches somehow mix control-plane (management) and dataplane traffic, which is not ideal from a security perspective.

We were searching for a proper solution which can achieve the same convenient and fast solution but within layer-3.

## Requirements

The following requirements must be fulfilled with a L3 replacement solution:

- Clear separation of control-plane (management) and dataplane traffic
- Same "no-touch" experience for new servers
- Configurability of metal-hammer version per partition in real time
- token based authentication against metal-apiserver of the metal-hammer
- Cache of metal-images accessible from metal-hammer inside a partition
- Preserve all existing metal-hammer discovery, hardware detection, and provisioning logic
- Secure network when machine reclaim goes wrong with ACLs on the switch which allows communication only to the control-plane and the `metal-boot`
- Optional: make `metal-boot` a proxy to metal-apiserver to support IPv4 only control-plane deployments.
- Optional: make `metal-boot` itself act as NTP and DNS server for the metal-hammer. Together with the proxy to the control-plane this would allow to restrict external access to the `metal-boot` source IP (even IPv4 and IPv6).
- `metal-boot` is stateless and can be deployed multiple times and listens to the same anycast IPv6 address for redundancy.
- TODO more

## High level Architecture

The main idea is based on three concepts.

- Boot from ISO feature of server bmc firmware which can be configured from remote via redfish.
- Enable automated IPv6 address acquisition via SLAAC (RFC 4862) driven by Router Advertisements (RFC 4861) instead of DHCP
- IPv6 in a dedicated Boot VRF instead of a Boot VLAN.

This approach requires that metal-apiserver, metal-hammer, ipxe and a new component running in the partition and connected to the boot-vrf (`metal-boot` for now) are IPv6 ready.

The L3 only boot and registration process can be described as follows:

- Every server will be scanned on a regular basis from the metal-bmc if there is IPXE is configured as boot iso payload. This is a additional task on the metal-bmc. metal-bmc already scans all servers on a regular basis to gather power metrics etc.
- If the boot iso is set to ipxe, the boot source override must be set to CDROM instead of PXE from network and a reboot must be triggered (migration to this approach, not when a machine is allocated).
- Once the server is powered on, ipxe is booted from the CDROM presented from the firmware.
- The production interfaces will then get a IPv6 routable ip address from the switch which is configured to enable SLAAC and router advertisement. The configured routes must enable the machine to reach the metal-apiserver in the control plane and the `metal-boot` in the partition.
- The IPXE iso must contain a boot configuration which chain loads from a known location a secondary boot configuration. To speed up the ipxe startup, the boot.ixpe should disable ipv4 completely as otherwise ipxe will try dhcp first.
    Sample:

    ```ipxe
    #!ipxe
    chain https://v2.metal-stack.dev/<partition>/boot.ipxe || shell
    ```

    The secondary boot.ipxe will then contain the same payload as actually delivered from pixiecore. This especially contains the configured linux kernel, metal-hammer version, command line and the url in the boot vrf of the boot-helper.
- With this ipxe will boot into metal-hammer and will contact first the boot-helper on the given url and will get a token to access the metal-apiserver
- metal-image-cache-sync address is also reachable in the boot vrf and works as before.

![Logical View](./layer-3-logical.drawio.svg)

![Sequence Diagram](./layer-3-sequence.drawio.svg)

## Implementation

Before we start with the implementation or decision if this is the right approach and way to go we should ensure that the current draft is at least working as expected.

This must be done in several steps:

- [x] ensure ipxe can be packed as ISO image stored in the firmware, booted with DHCP disabled and get a IP with routes from a SLAAC enable switch.
- [x] The initial boot.ipxe contains instruction to pull a secondary boot.ipxe which contains kernel, image and cmdline and ipxe chain boots this.
- [ ] can ipxe resolve hostnames to ipv6 addresses ?
- [ ] Specify how the boot vrf must be configured on the SONiC Side
- [ ] Specify how metal-hammer kernel must be configured to accept router advertisements
- [ ] how do we configure the boot vrf on the switch, e.g. which address space will be set per port, is it stored in the metal-apiserver and configured by metal-core.

After all these tasks are done, we can proceed and write a more detailed implementation roadmap and requirements with changes in the api and apiserver or other microservices.

## Necessary Changes

This section will summarize what changes are necessary to implement MEP-20 in metal-stack.

## metal-hammer

metal-hammer will need to bring up the physical Interface of the server it is running on. When using the boot option ip=dhcp the linux kernel fully configures the interface before loading the initrd. metal-hammer should execute the following steps.

- bring up the physical machine interface
- perform SLAAC
- wait for duplicate address detection to complete

metal-hammer can then proceed as before.

## metal-api

The metal-api will need the following changes.

- metal-api currently models the booting state as PXEBooting. This should be updated and an additional boot event added for ISO Boot.
- metal-api will need to store and assign the boot address space. There should be a boot supernet per partition from which per port /64 networks are assigned.
- metal-api will need to assign the new boot vrf instead of the PXE VLAN

## sonic-configdb-utils

sonic-configdb-utils will need to support additional ACL configuration options for ipv6 to prevent east-west traffic between unprovisioned machines. The ruleset is static, so it can be built similarly to the existing CTRLPLANE tables. (permit metal-boot followed by deny all)

## metal-core

metal-core will need to support additional configuration templates for the boot vrf. 

```
suggested configuration TBD
```

metal-core will also need to dynamically bind the boot ACLs to each port. 

## metal-bmc

metal-bmc already scans targets periodically to gather information. In addition to gathering information, metal-bmc should enforce the inserted CDROM and boot mode override. 

## go-hal

go-hal currently does not support the insertion and removal of virtual media. 
