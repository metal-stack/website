# VRF-Based Boot for metal-hammer

Replacing PXE with BMC boot-from-ISO and VLAN-free networking via SONiC VRFs.

---

## 1. Problem Statement

The current boot process relies on:

1. Switch port VLAN configuration
2. DHCP broadcasts confined to the VLAN
3. iPXE loaded via TFTP/PXE from the network
4. metal-hammer initrd executed by iPXE

This introduces complexity: VLANs must be provisioned on every switch port, PXE infrastructure (TFTP/DHCP/Pixiecore) must be maintained, and the entire process is broadcast-based, making it harder to scale and troubleshoot.

### Goals

- Replace PXE/iPXE with BMC boot-from-ISO
- Eliminate per-port VLANs on the switch plane
- Place all servers in a boot VRF instead of a boot VLAN
- Enable automated IP address acquisition for the ISO-booted metal-hammer without VLANs

---

## 2. Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        metal-control-plane                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │metal-api │  │nsq       │  │metal-core│  │metal-bmc     │   │
│  │(REST/API)│  │(messaging)│  │(on k8s)  │  │(firmware mgmt)│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│         │             │              │                          │
└─────────┼─────────────┼──────────────┼──────────────────────────┘
          │             │              │
    ┌─────┴─────────────┴───────┐     │
    │     Kubernetes cluster     │     │
    └───────────────────────────┘     │
                                       │ routes / VRF leak
┌──────────────────────────────────────┴──────────────────────────┐
│                          boot VRF                               │
│                                                                 │
│  ┌────────┐    ┌────────┐    ┌────────┐                        │
│  │Server 1│    │Server 2│    │Server 3│  access ports (VRF)    │
│  │        │    │        │    │        │                        │
│  │BMC:ISO │    │BMC:ISO │    │BMC:ISO │                        │
│  │UEFI:bo│    │UEFI:bo│    │UEFI:bo│    ← no VLANs            │
│  │ot+DHCP│    │oot+DHCP│    │oot+DHCP│    ← SLAAC/SLAAC       │
│  │v6     │    │v6     │    │v6     │                        │
│  └───┬────┘    └───┬────┘    └───┬────┘                        │
│      │             │             │                             │
│      └─────────────┼─────────────┘                             │
│                    │                                            │
│            ┌───────┴────────┐                                  │
│            │ leaf switch VRF │  (SONiC VrfBoot)                │
│            │  Vrf-Boot int   │  DHCPv6 server + RA             │
│            │  metal-core     │  L3 interface in VRF            │
│            │  proxy here     │                                  │
│            └──────────────────┘                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Aspect | Current (PXE) | Proposed (VRF-based) |
|--------|---------------|---------------------|
| Boot media | PXE network boot via iPXE | ISO mounted via BMC virtual CD |
| Network config | DHCP on VLAN | DHCPv6 SLAAC on VRF |
| Switch port config | Trunk/access with VLAN | Access port in VRF (no VLAN tag) |
| Discovery proxy | metal-core on switches | metal-core on switches (same, but on VRF interface) |
| Switch OS | SONiC | SONiC with VRFs |

---

## 3. Component Details

### 3.1 The metal-hammer ISO

Create a hybrid ISO image containing:

```
metal-hammer-initrd.iso
├── EFI/BOOT/
│   ├── BOOTX64.EFI          ← shim/GRUB for UEFI boot
│   ├── grub.cfg             ← bootloader config
├── boot/
│   ├── vmlinuz              ← Linux kernel (same kernel used by PXE today)
│   ├── initrd.img           ← metal-hammer initrd (same today)
│   └── metal.config         ← cmdline parameters (JSON)
```

**metal.config** (injected by metal-bmc at boot time):

```json
{
    "metal_api_url": "https://metal-api.metal-stack.io",
    "disk": "",
    "hostname": "",
    "firewall": false,
    "swap": 0,
    "isoUrl": "",
    "isoFingerprint": "",
    "ipze": {},
    "console": "console=tty0 console=ttyS0,115200n8",
    "ipv6": true,
    "disable_swap": false,
    "powerdown": false,
    "nodiskwipe": false,
    "ntp_servers": ["0.pool.ntp.org", "1.pool.ntp.org"],
    "dns_servers": ["10.0.0.10"],
    "sshd": false,
    "hardware_discovered": false,
    "dry_run": false,
    "metal_ticket": "",
    "machine": {
        "allocation": "urn:uuid:xxx"
    },
    "vpc": {}
}
```

**ISO creation workflow:**

1. metal-bmc receives a "discover" request from metal-api for an unallocated server
2. metal-bmc configures the BMC:
   - Mounts the virtual CD with the ISO
   - Sets boot device to `cdrom`
3. Server UEFI firmware boots from virtual CD
4. grub.cfg passes kernel parameters including the metal-api URL over HTTPS

**Build command:**

```bash
mkisofs -o metal-hammer-initrd.iso \
  -b EFI/BOOT/BOOTX64.EFI \
  -no-emul-boot \
  -boot-load-size 4 \
  -boot-info-table \
  -V "METAL-HAMMER" \
  -J -R \
  boot/vmlinuz \
  boot/initrd.img \
  boot/metal.config \
  EFI/
```

### 3.2 Server + BMC Setup

#### IPMI Boot Configuration (via metal-bmc)

```bash
# Set boot device to CD-ROM (virtual media)
ipmitool chassis bootdev cdrom

# Set boot params to include kernel cmdline from metal.config
ipmitool bmc exec "echo 'root=/dev/ram0 init=/sbin/init console=tty0 ...' > /tmp/cmdline"

# Power on (if not already on)
ipmitool chassis power on
```

#### UEFI Network Setup

Modern UEFI firmwares (AMI Aptio, Intel UEFI) support IPv6 autoconfiguration via:

- **OpenNetworkStack / Intel PXE**: UEFI NIC stack handles DHCPv6 and SLAAC
- **EDK2 Network Stack**: Supports `ipv6 accept-dhcpv6` in Setup menu
- **Dell iDRAC / HPE iLO**: BMC UEFI shell supports `net -6 dhcp`

The UEFI firmware stack must be configured (out-of-band or via BMC) to:
1. Accept DHCPv6 information (IA_NA) for global IPv6 address
2. Accept Router Advertisements for SLAAC address generation
3. Use these addresses as the source for all subsequent traffic

**Dell iDRAC example:**

```bash
# Configure UEFI network via racadm
racadm set BIOS.Setup.Step.OneTimeBoot UefiTarget,CD
racadm set BIOS.Setup.Step.PowerPolicy RestoreOnPowerLoss
racadm set NIC.UEFIEthernetNetworkStack IPv6
racadm set NIC.UEFIEthernetDHCPv6 Dhcpv6Enable
racadm set NIC.UEFIEthernetDHCPv6 Dhcpv6Stateful Enable
racadm set NIC.UEFIEthernetDHCPv6 Dhcpv6Duid DuidTypeLL
racadm set NIC.UEFIEthernetNetworkStack DNS AutoConfig
```

### 3.3 Leaf Switch Configuration (SONiC VRF)

#### VRF Creation

```bash
# Create VRF for the boot network
ip link add name VrfBoot type vrf table 100

# Assign the uplink interface to the VRF (if needed)
ip link set eth0 master VrfBoot

# Assign server-facing ports to the VRF
for if in eth1 eth2 eth3 eth4; do
    ip link set $if master VrfBoot
done

# Set L3 interface on VRF for DHCPv6/RA
ip addr add 2001:db8:boot::1/64 dev VrfBoot
ip addr add 10.168.168.1/24 dev VrfBoot
ip link set VrfBoot up
```

#### DHCPv6 Server on SONiC

Use the built-in DHCPv6 server (isc-dhcp-server or kea-dhcp) container on SONiC:

```yaml
# /etc/dhcp/dhcpd6.conf for VrfBoot
# IPv6 prefix delegation pool for boot servers
subnet6 2001:db8:boot::/64 {
    range6 2001:db8:boot::100 2001:db8:boot::ffff;
    option dhcp6.name-servers 2001:db8:boot::10;
    option dhcp6.domain-search "metal.local";
    option dhcp6.nsapopt 2001:db8:boot::10;
    option dhcp6.boot-url "http://10.168.168.1:8080/pixiecore/boot.ipxe.cfg";
    # This is the URL that the booted metal-hammer uses to
    # contact metal-core / metal-api
    option dhcp6.boot-file-url "http://10.168.168.1/metal-hammer/";
}
```

#### Router Advertisements (SLAAC)

for Linux see: https://oneuptime.com/blog/post/2026-03-20-slaac-configure-linux/view

```bash
# Enable IPv6 forwarding on the VRF interface
sysctl -w net.ipv6.conf.VrfBoot.forwarding=1
sysctl -w net.ipv6.conf.VrfBoot.accept_ra=2

# Send Router Advertisements with prefix
ip -6 addr add 2001:db8:boot::1/64 dev VrfBoot
# If using radvd:
#   /etc/radvd.conf:
#   interface VrfBoot {
#       AdvSendAdvert on;
#       prefix 2001:db8:boot::/64 {
#           AdvOnLink on;
#           AdvAutonomous on;
#       };
#   };
```

#### Port Configuration (No VLANs)

```bash
# All server-facing ports as access ports in the boot VRF
# NO VLAN tagging, NO trunk configuration

# Port assignment to VRF
for port in "Ethernet0" "Ethernet4" "Ethernet8" "Ethernet12"; do
    # Remove port from any existing VLAN
    vconfig rm "${port}.100" 2>/dev/null || true

    # Assign to VRF (L3 port)
    config vrf bind VrfBoot $port
done

# Ensure port is up
config port status $port up
```

#### BGP / Route Distribution

```bash
# metal-api and metal-core need to be reachable from the boot VRF

# Option 1: Route leaking (recommended)
# In SONiC config DB, configure FRR route leaking between VRFs:
sonic-db CONFIG_DB get "VRF|VrfBoot"|grep -i route 2>/dev/null || sonic-db CONFIG_DB set "VRF|VrfBoot" "ipv6_route_list" "[\"2001:db8:boot::/64\"]"

# Option 2: Static routes in VRF
ip -6 route add 10.0.0.0/8 via 2001:db8:boot::254 dev VrfBoot table 100

# Option 3: BGP redistribution
# Configure FRR ospf/bgp in VrfBoot to redistribute routes
```

### 3.4 metal-core Proxy on VRF

The existing metal-core service already runs on the leaf switches. It must now listen on the VRF interface instead of the VLAN interface:

```go
// metal-core listening configuration
vrfInterface := "VrfBoot"
listenAddr := "0.0.0.0:18090" // metal-core default

// Ensure the listener binds to the VRF interface
conn, err := net.Listen("tcp4", fmt.Sprintf("[%s%%%s]:%s", "fe80::1", vrfInterface, "18090"))
if err != nil {
    log.Fatalf("failed to listen on VRF interface: %v", err)
}
```

metal-core's existing functionality (switch MAC address lookup, machine registration, metal-api proxy) remains unchanged. The only modification is the bind interface and the source IP address (now resolved via VRF routing instead of VLAN).

---

## 4. IP Address Acquisition Paths

Three options, from most to least recommended:

### 4.1 Option A: DHCPv6 SLAAC (Recommended)

The server's UEFI NIC stack sends a DHCPv6 Information-Request and receives Router Advertisements on boot:

```
Server                      Leaf Switch (VrfBoot)           metal-api
  |                               |                           |
  |--- NDP Router Solicitation --->|                           |
  |<-- RA (prefix + flags)--------|                           |
  |                               |                           |
  | (SLAAC: generate IPv6 via     |                           |
  |  EUI-64 / privacy)            |                           |
  |                               |                           |
  |--- DHCPv6 INFO-REQUEST ------->|                           |
  |<-- DHCPv6 REPLY (DNS, etc.)---|                           |
  |                               |                           |
  | (now has IPv6 global)         |                           |
  |                               |                           |
  |=== HTTPS to metal-api:443 ====>|==========================>|
  |                               |                           |
  |<== machine info ===============|                           |
  |                               |                           |
  | (metal-hammer does            |                           |
  |  hardware discovery)          |                           |
  |                               |                           |
  |--- HTTP to metal-core =======>|                           |
  |<== switch MAC map =============|                           |
  |                               |                           |
  | (metal-hammer reports         |                           |
  |  HW info, waits for alloc)    |                           |
```

**Requirements:**
- Server UEFI firmware must support IPv6 (most do on servers from 2018+)
- SONiC VRF must send Router Advertisements with a prefix
- DHCPv6 server behind the VRF interface (or RA includes ISP info)
- No DHCPv6 stateful needed — SLAAC alone provides the address

**Pros:** Zero DHCP state to maintain, fully automatic, no VLAN mapping

### 4.2 Option B: IPv6 Link-Local + DHCPv4 Fallback

```
  |--- NDP Neighbor Solicitation (fe80:: link-local) -->|
  |<-- NDP Neighbor Advertisement ----------------------|
  | (fe80::/10 now available for source address)        |
  |                                                     |
  |--- DHCPv4 Discover (ff:ff:ff:ff) ------------------>|
  |<-- DHCPv4 Offer (10.168.168.100/24) ----------------|
  |                                                     |
  |=== Now has routable IPv4 address ====>              |
  | HTTPS to metal-api                                  |
```

**Pros:** Works even when UEFI IPv6 is not fully supported. Provides dual-stack capability.
**Cons:** Requires DHCPv4 server in the VRF, broadcast-based like PXE today.

### 4.3 Option C: Static MAC-based IPv6

```
Server MAC: 00:1a:2b:3c:4d:5e

SONiC VRF config:
  prefix 2001:db8:boot::/64
  static 2001:db8:boot::100/64 via 00:1a:2b:3c:4d:5e (neighbor)

RA provides the prefix.
Server generates address via SLAAC (EUI-64 or privacy extensions).
Address: 2001:db8:boot::100 (or random privacy address)
```

**Pros:** No DHCP server at all.
**Cons:** Requires static mapping of MAC to IPv6 prefix. Doesn't scale as well for very large deployments.

---

## 5. Discovery Boot Sequence with VRF

```
┌─────────────────────────────────────────────────────────────┐
│                    1. BMC Sets Up ISO Mount                   │
│     metal-bmc detects unprovisioned, unallocated server      │
│     metal-bmc configures BMC virtual CD with ISO             │
│     metal-bmc sets IPMI boot device to cdrom                 │
│     metal-bmc ensures UEFI IPv6 stack is enabled             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. Server Boots from ISO                   │
│     UEFI firmware reads ISO from virtual CD                  │
│     GRUB loads vmlinuz + initrd.img                          │
│     Kernel parameters include metal-api URL, console, etc.   │
│     Kernel starts, loads initrd (metal-hammer)               │
│     golang init process starts in metal-hammer               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  3. NIC Stack Autoconfiguration                │
│     UEFI NIC stack (already active in ISO environment)       │
│     Receives RA → generates SLAAC IPv6 address               │
│     Sends DHCPv6 INFO-REQUEST → receives DNS config         │
│     (Optional: DHCPv4 Discover → routable IPv4)             │
│     metal-hammer sees: ip a   → has IPv6 address             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  4. Hardware Discovery                        │
│     metal-hammer ensures all NICs are up                     │
│     Detects active uplinks, switch chassis MAC               │
│     Reports HW info to metal-api (via metal-core proxy)      │
│     Checks: UEFI mode? If BIOS, set BIOS→UEFI, reboot       │
│     Wipes disks (secure erase or mkfs.ext4 --discard)        │
│     Sets BIOS boot order: PXE → Hard Disk                    │
│     Waits for machine create command from metal-api          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  5. OS Provisioning                           │
│     machine create command received                          │
│     metal-hammer downloads target OS image from metal-image  │
│     Writes image to disk                                       │
│     kexec into new kernel                                      │
│     Server boots into target OS                                │
│     metal-hammer ISO detached (metal-bmc)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. metal-bmc Changes Required

metal-bmc needs to understand the new boot mechanism:

```go
// New method: Configure boot-from-ISO
func (bmc *BMC) ConfigureIsoBoot(serverId string, isoUrl string) error {
    // 1. Mount ISO via virtual media
    err := bmc.ioutilMount(isoUrl)
    if err != nil {
        return fmt.Errorf("failed to mount ISO: %w", err)
    }

    // 2. Set boot device to CD-ROM
    err = bmc.ipmitoolSetBootDevice("cdrom")
    if err != nil {
        return fmt.Errorf("failed to set boot device: %w", err)
    }

    // 3. Configure UEFI IPv6 stack (if required)
    switch bmc.vendor {
    case "dell":
        return bmc.racadmSetEFI()
    case "hpe":
        return bmc.iloSetEFI()
    case "supermicro":
        return bmc.ipmiSetEFI()
    }
    return nil
}

// New method: Detach ISO after kexec into target OS
func (bmc *BMC) DetachIso() error {
    // Ensure the ISO is unmounted to prevent re-boot
    return bmc.ioutilUnassign()
}
```

### Vendor-Specific Considerations

| Vendor | Virtual Media | UEFI IPv6 Config |
|--------|--------------|-----------------|
| Dell iDRAC 9 | `racadm serverbios bootoneforce cd` | `racadm set NIC.UEFIEthernetDHCPv6 Dhcpv6Enable` |
| HPE iLO 5 | `ilo-set --boot-source dev=cdrom --boot-source-action enable` | `ilo-set --boot-params enable-ipv6-stack=true` |
| Supermicro IPMI | `ipmitool chassis bootdev cdrom` | Vendor-specific SEL commands |

---

## 7. Switch Configuration Changes

### 7.1 Current (VLAN-based)

```bash
# Each server gets a VLAN
config vlan add 1000 Ethernet0
config port member add Ethernet0 1000
# metal-core listens on VLAN 1000 interface
ip link add link eth0 name eth0.1000 type vlan id 1000
```

### 7.2 Proposed (VRF-based, no VLANs)

```bash
# Create a single VRF for all boot servers
ip link add name VrfBoot type vrf table 100

# All server-facing ports go directly into VRF — no VLAN tagging
for port in Ethernet0 Ethernet4 Ethernet8 ...; do
    config vrf bind VrfBoot $port
done

# L3 interface on VRF for DHCP/RA/proxy
ip addr add 2001:db8:boot::1/64 dev VrfBoot
ip addr add 10.168.168.1/24 dev VrfBoot
ip link set VrfBoot up
```

### 7.3 SONiC config-db Changes

```json
{
    "VRF": {
        "VrfBoot": {
            "ipv4_route_list": "[\"10.0.0.0/8\"]",
            "ipv6_route_list": "[\"2001:db8:boot::/64\"]"
        }
    },
    "PORT": {
        "Ethernet0": {
            "alias": "server1-port1",
            "vrf_name": "VrfBoot"
        },
        "Ethernet4": {
            "alias": "server2-port1",
            "vrf_name": "VrfBoot"
        }
    }
}
```

---

## 8. Advantages Over PXE

| Aspect | PXE (current) | VRF + ISO (proposed) |
|--------|---------------|---------------------|
| Switch config | Per-port VLAN | VRF binding (no VLAN) |
| DHCP requirement | DHCP broadcast on VLAN | DHCPv6 SLAAC on VRF (unicast-capable) |
| Boot infrastructure | Pixiecore + TFTP + DHCP server | BMC virtual media + HTTP/HTTPS |
| MAC/vLAN mapping | Complex: must discover which VLAN each server belongs to | Removed: no VLANs to map |
| Boot media | iPXE script on TFTP server | ISO file in BMC storage / HTTP |
| UEFI support | Via iPXE NIC driver | Native UEFI boot from CD |
| Firewall config | Open TFTP (69), DHCP (67/68), HTTP (80) | Open HTTPS (443), HTTP (80/8080) |
| Boot isolation | VLAN isolation | VRF isolation |

---

## 9. Implementation Roadmap

### Phase 1: ISO Creation and Testing
- Create metal-hammer ISO with UEFI boot
- Test boot in QEMU/KVM with virtio networking
- Verify metal-hammer discovers hardware successfully
- Test DHCPv6 SLAAC in QEMU environment

### Phase 2: Vendor Implementation
- Implement ISO boot configuration per BMC vendor (Dell, HPE, Supermicro)
- Add `ConfigureIsoBoot` and `DetachIso` to metal-bmc
- End-to-end test: metal-bmc triggers ISO boot → server discovers itself

### Phase 3: Switch VRF Configuration
- Implement SONiC VRF provisioning via metal-core
- Configure DHCPv6 server + RA on leaf switches
- Update switch port configuration: VLAN → VRF binding

### Phase 4: Integration
- Update metal-hammer to handle VRF networking
- Test full provisioning pipeline: discover → allocate → kexec
- Validate route propagation from boot VRF to metal-api

### Phase 5: Migration and Rollout
- Deploy in new partition first
- Gradual migration of existing partitions (dual-boot mode)
- Remove PXE/Pixiecore infrastructure from production

---

## 10. Open Questions and Risks

### 10.1 UEFI IPv6 Support Varied by Vendor

Some BMC vendor firmwares may not properly support UEFI IPv6 DHCP. Workarounds:

- metal-hammer initrd can include its own DHCPv6 client as fallback
- initrd can include `ip -6` commands to configure link-local + RA manually
- DHCPv4 fallback provides a universal baseline

### 10.2 Metal-API HTTPS in ISO Environment

The ISO-based metal-hammer still needs to reach the metal-api over HTTPS. In the current PXE setup, the metal-core proxy handles certificate validation on the switch side. The ISO approach should keep the metal-core proxy for the same reason:

- metal-hammer connects to metal-core (HTTP, local)
- metal-core proxies to metal-api (HTTPS, with proper certs)

This avoids the need to distribute CA certificates into every ISO image.

### 10.3 BMC Storage for ISO

The ISO must be stored somewhere accessible to BMCs:

- Option 1: Each BMC stores a copy (duplicates ISO into iDRAC/iLO/AST2500 storage)
- Option 2: NFS mount accessible from BMCs (requires NFS server)
- Option 3: metal-bmc copies ISO to BMC local storage via IPMI sel/firmware commands
- Option 4: metal-bmc streams ISO to BMC during boot configuration

### 10.4 Boot Order on Reboot

If metal-hammer kexecs into the installed OS, the next reboot must NOT boot from ISO again. metal-bmc must:

1. Detach the ISO after successful kexec
2. Set boot device to `harddisk` (or use one-shot boot)

```bash
# One-shot: boot from ISO once, then switch to disk
racadm set ServerBoot.BootSeq0 UefiTarget,CD
racadm set ServerBoot.BootSeq1 UefiTarget,HDD
racadm serverbios bootoneforce cd

# After kexec succeeds, reset to disk-first
racadm set ServerBoot.BootSeq0 UefiTarget,HDD
racadm set ServerBoot.BootSeq1 UefiTarget,CD
```

### 10.5 SONiC VRF Configuration at Scale

SONiC VRF configuration must support rapid configuration changes during provisioning. metal-core could extend its existing "switch config" capabilities to support dynamic VRF port binding.

This may require changes to metal-core to support:
- Dynamic VRF creation per partition
- Dynamic port-to-VRF binding per MAC address
- Route redistribution between VRFs

---

## Appendix A: QEMU Test Setup

Quick local test without real hardware:

```bash
#!/bin/bash
# Test the metal-hammer ISO with QEMU

ISO=metal-hammer-initrd.iso

qemu-system-x86_64 \
  -enable-kvm \
  -m 4096 \
  -smp 4 \
  -cdrom $ISO \
  -drive format=raw,file=disk.raw,size=100G \
  -net nic,model=virtio \
  -net user,hostfwd=tcp::8080-:80,hostfwd=tcp::443-:443 \
  -serial stdio \
  -bios /usr/share/OVMF/OVMF_CODE.fd \
  -global driver=cfi.pflash01,property=secure,value=off
```

The `-net user` provides NAT-based networking with DHCP and DNS — equivalent to the boot VRF in production. This allows testing the full metal-hammer flow without real BMCs or switches.


# More notes

# IP Address Acquisition for ISO-booted metal-hammer
     This is the core problem. Several options:

     Option A: UEFI + DHCPv6 SLAAC (Recommended)

     UEFI firmware in modern servers supports ipv6 accept-dhcpv6 (OpenNetworkStack in AMI, OpenDHCP in Intel). Metal-hammer boots, UEFI NIC stack sends DHCPv6 with IA_NA, gets a link-local + ULA from a DHCPv6 server in the boot VRF. Combined with SLAAC prefix, autoconfigures
     a global IPv6 address. No VLAN needed — works on plain access ports.

     Option B: IPv6 Link-Local + DHCPv4 fallback

     UEFI autoconfigures IPv6 link-local (fe80::/10) immediately. metal-hammer uses this as initial source address to contact metal-core proxy. If the metal-api is reachable in the VRF route domain, great. Otherwise, DHCPv4 in the VRF provides a DHCP address. Dual-path gives
     redundancy.

     Option C: Static MAC-based IPv6 (RA-based)

     Configure the router in the boot VRF to send Router Advertisements with a prefix. Server UEFI stack generates IPv6 via SLAAC (EUI-64 / modified privacy) using its MAC. Zero-config, fully automatic, no DHCP server needed at all.

     4. metal-hammer networking in ISO mode

     The critical difference: currently metal-hammer uses metal-core (running on leaf switches) as a proxy to the metal-api. With boot-from-ISO, metal-core still sits on the switches but now it proxies over the VRF instead of over the VLAN. This works because:

     - metal-core listens on the VRF interface on the switch
     - metal-hammer connects to it via the VRF
     - metal-core still does the "switch MAC lookup" that the hammer can't do itself
     - The metal-api is reachable from the boot VRF (route leaking or direct routing)

# Server Vendor differences

     Dell iDRAC9

     - Unique: racadm CLI is its own protocol on 443, not IPMI. It's extremely powerful for UEFI BIOS settings and virtual media. Redfish is also excellent.
     - ISO mount: Supports HTTP/HTTPS/NFS/CIFS sources. You can point iDRAC9 at a remote ISO URL or upload one to local iDRAC flash (~4GB limit).
     - Boot: Strong one-shot boot support via racadm bootset oneboot cdrom and Redfish BootSourceOverrideEnabled: Once. This is critical — you mount the ISO, set one-shot CD, the machine boots once, then resets to normal boot order automatically. No explicit DetachIso needed.
     - UEFI settings: racadm getsysbiossettings can read/write UEFI variables including network stack settings. These are applied ApplyOnce via Redfish. iDRAC9 can remotely modify UEFI boot settings without needing the OS.
     - Best: The most mature and well-documented. racadm + Redfish gives full automation capability.

     Supermicro XCC

     - Unique: Relies on standard IPMI 2.0 ipmitool + Redfish. No proprietary CLI like racadm (the sms tool is Windows-only GUI). XCC is an Aspeed AST2500-based controller.
     - ISO mount: Local upload, HTTP/HTTPS, FTP/SMB. Virtual media schema fully redfish-compliant.
     - Boot: ipmitool chassis bootdev cdrom --period=once works. IPMI is the standard way but lacks boot order manipulation.
     - UEFI settings: No getsysbiossettings equivalent exists. UEFI variables are modified via ipmitool raw 0x30 0x40 OEM commands or web UI. Much harder to automate UEFI configuration.
     - Best: Standard IPMI is ubiquitous and well-understood, but advanced UEFI settings require OEM raw commands or web UI — harder to script.

     Fujitsu FUTU/iRMM5

     - Unique: Dual management stack — proprietary FJRPC protocol (on port 443) plus Redfish and IPMI. FJRPC is the "real" Fujitsu management layer; Redfish is a secondary abstraction.
     - ISO mount: Local upload, HTTP/HTTPS. NFS/CIFS support unclear.
     - Boot: Standard IPMI works. FJRPC provides additional controls but documentation is sparse. Enterprise support is essentially required.
     - UEFI settings: Web UI only for most settings. FJRPC has BIOS controls but not well documented publicly.
     - Key gap: This is the weakest vendor for automation. Limited public documentation, proprietary APIs, and lack of standard tooling make programmatic boot-from-ISO very difficult without Fujitsu vendor engagement.

     Gigabyte GMC/BMC

     - Unique: BMC is Aspeed AST2500/AST2600 but Gigabyte doesn't provide a proprietary CLI. GMC is a Java/HTML5 client. Newest firmwares support Redfish.
     - ISO mount: Local upload, HTTP/HTTPS. SMB/CIFS varies by firmware. NFS unclear.
     - Boot: IPMI chassis bootdev commands work. No vendor-specific enhancements.
     - UEFI settings: Basically none from BMC. Must use web UI or physical access. No racadm equivalent, no useful OEM IPMI raw commands documented.
     - Key gap: Worst documentation of the four. Limited Redfish on older firmware, no CLI tool, no documented way to set UEFI variables programmatically. Best-effort IPMI works but advanced boot-from-ISO automation would be very difficult.

     Implementation Implications

     The design needs a vendor abstraction layer in metal-bmc with these concrete impacts:

     Dell (easiest): One-shot CD boot via Redfish or racadm. UEFI IPv6 settings configurable remotely. ISO sourced via HTTP/NFS URL from iDRAC9. Most of the boot flow can be fully automated.

     Supermicro (harder but manageable): One-shot CD via ipmitool --period=once works. ISO mount via Redfish VirtualMedia works. But configuring UEFI IPv6 stack requires OEM IPMI raw commands or a pre-configured BIOS template applied via ipmitool raw — this is fragile and
     model-dependent.

     Fujitsu (hard): Requires FJRPC engagement with Fujitsu. IPMI works for basic boot device switching but UEFI/NIC stack automation is undocumented. ISO mount paths unclear.

     Gigabyte (hard): No UEFI settings control from BMC at all. IPv6 in UEFI would need to be set once physically or via web UI. ISO mount depends on which firmware revision the server has.

     A practical strategy: Dell and Supermicro first (where automation is feasible), Fujitsu and Gigabyte with manual UEFI configuration steps (e.g. "configure UEFI IPv6 once on first boot via web UI, then boot-from-ISO works for all future boots automatically since IPv6
     settings persist in NVRAM).

     https://metal-stack.io/community/MEP-18-autonomous-control-plane