# MEP-20: VRF Based Boot without PXE

This proposal replaces the PXE-based discovery and boot process for metal-hammer with a BMC boot-from-ISO approach that uses IPv6 SLAAC (Stateless Address Autoconfiguration) driven by route advertisements for IP address acquisition. Per-port VLANs are eliminated in favor of SONiC VRFs, simplifying switch configuration and removing the need for DHCP broadcast domains.

---

## 1. Problem Statement

The current machine boot and discovery process relies on:

1. Per-port VLAN configuration on leaf switches
2. DHCP broadcast confinement within each VLAN
3. PXE boot chains: iPXE loaded via TFTP, executing metal-hammer initrd
4. Maintenance of PXE infrastructure (TFTP/DHCP/Pixiecore servers)

This approach introduces several operational problems:

- **VLAN proliferation**: Every partition and every server needs a unique VLAN ID, consuming the 4096-VLAN limit and creating complex trunk configurations across the switch fabric.
- **PXE infrastructure complexity**: TFTP servers, DHCP relays, and iPXE scripts must be maintained and are single points of failure during discovery.
- **Broadcast-based discovery**: DHCP broadcasts do not cross Layer 3 boundaries, requiring DHCP relay agents and introducing a dependency on broadcast reachability.
- **VRF-to-VLAN switching complexity**: metal-core must reconfigure a port where a machine is connected to from VRF to VLAN and back, this induces a lot of stress to the SONiC Control Plane.
- **VLAN Distribution**: It is difficult to distribute the PXE VLAN in the fabric without compromising the distinction between the production- and control traffic.

### Goals

- Replace PXE/iPXE with BMC virtual media (boot-from-ISO)
- Eliminate per-port VLANs on the switch plane entirely
- Use SONiC VRFs for boot network isolation instead of VLANs
- Enable automated IPv6 address acquisition via SLAAC (RFC 4862) driven by Router Advertisements (RFC 4861)
- no DHCP server required for address assignment
- Simplify switch port configuration to VRF binding only
- Preserve all existing metal-hammer discovery, hardware detection, and provisioning logic

### Non-Goals

- Replacing metal-hammer or the metal-api
- Changing the OS provisioning workflow (disk wipe, image download, kexec)
- Supporting IPv4-only networks (IPv6 is a hard requirement)

---

## 2. Proposed Architecture

### 2.1 High-Level Design

```raw
┌──────────────────────────────────────────────────────────────────────┐
│                        metal-control-plane                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐      │
│  │ metal-api│  │ nsq      │  │pixie-core│  │     metal-bmc    │      │
│  │(REST/API)│  │          │  │          │  │                  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘      │
│         │             │              │                               │
└─────────┼─────────────┼──────────────┼───────────────────────────────┘
          │             │              │
                                       │ routes / VRF leak
┌──────────────────────────────────────┴─────────────────────────────┐
│                          boot VRF (per partition)                  │
│                                                                    │
│  ┌────────┐    ┌────────┐    ┌────────┐                            │
│  │Server 1│    │Server 2│    │Server N│  access ports in VRF       │
│  │        │    │        │    │        │  (no VLANs)                │
│  │BMC ISO │    │BMC ISO │    │BMC ISO │                            │
│  │UEFI→RA │    │UEFI→RA │    │UEFI→RA │  ← SLAAC autoconfig        │
│  └───┬────┘    └───┬────┘    └───┬────┘                            │
│      │             │             │                                 │
│      └─────────────┼─────────────┘                                 │
│                    │                                               │
│            ┌───────┴────────┐                                      │
│            │ leaf switch VRF│  (per partition, isolated)           │
│            │  L3 interface  │  sends Route Advertisements          │
│            │  pixie-core    │  listens on VRF interface            │
│            │  proxy here    │                                      │
│            └────────────────┘                                      │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Key Design Decisions

| Aspect                 | Current (PXE)              | Proposed (RA + SLAAC)                         |
|------------------------|----------------------------|-----------------------------------------------|
| Boot media             | PXE network boot via iPXE  | ISO mounted via BMC virtual CD                |
| Network isolation      | Per-port VLAN              | SONiC VRF (Layer 3 isolation)                 |
| IP acquisition         | DHCP broadcast on VLAN     | SLAAC from Router Advertisements              |
| DHCP dependency        | Full DHCP server + relay   | None — RAs are multicast, stateless           |
| Switch port config     | Trunk/access with VLAN tag | Plain access port in VRF, no tag              |
| Discovery proxy        | pixie-core on VLAN         | pixie-core on VRF interface (unchanged logic) |
| MAC-to-network mapping | MAC → VLAN lookup          | MAC → switch port → VRF (trivial)             |
| Switch OS              | SONiC                      | SONiC with VRFs enabled                       |

### 2.3 Why Router Advertisements + SLAAC?

Router Advertisements (RAs) are a core IPv6 mechanism (RFC 4861) that enable hosts to autoconfigure addresses without any server state:

- **Stateless**: The switch sends RAs periodically (multicast to `ff02::1`) or solicitatively. No per-host state is tracked.
- **Zero configuration on the server**: The server's NIC stack generates a global IPv6 address from the advertised prefix using EUI-64 (RFC 4862, modified by privacy extensions RFC 4941).
- **Unchanged by VRF**: RAs work identically on a VRF-bound interface as on a VLAN-bound interface.
- **No DHCP server to maintain**: Removes an entire class of failure modes and operational overhead.
- **Complements existing pixie-core proxy**: After SLAAC provides connectivity, metal-hammer contacts pixie-core (HTTP) on the local VRF interface for switch topology discovery, then contacts metal-api (HTTP/S) through pixie-core for hardware inventory and allocation. FIXME: Better approach would be to have a small proxy running on every switch in the boot vrf which provides the metal-hammer with a token and partition specific configs.

---

## 3. Component Details

### 3.1 The metal-hammer ISO

A UEFI-bootable ISO image replaces the current iPXE boot chain:

```raw
metal-hammer-initrd.iso
├── EFI/BOOT/
│   ├── BOOTX64.EFI          ← UEFI bootloader shim
│   └── grub.cfg             ← Kernel and initrd parameters
├── boot/
│   ├── vmlinuz              ← Linux kernel (same as current PXE)
│   ├── initrd.img           ← metal-hammer initrd (same as current PXE)
│   └── metal.config         ← JSON configuration for metal-hammer
```

**metal.config** (injected by metal-bmc at boot time): FIXME

```json
{
    "metal_api_url": "https://metal-api.metal-stack.io",
    "hostname": "",
    "ipv6": true,
    "console": "console=tty0 console=ttyS0,115200n8",
    "metal_ticket": "",
    "machine": {
        "allocation": "urn:uuid:xxx"
    }
}
```

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

The configuration is small enough to embed in the ISO built or injected by metal-bmc before the BMC initiates the ISO mount and one-shot CD boot.

### 3.2 Server + BMC Workflow

#### ISO Boot Trigger (metal-bmc)

When metal-api receives a `discover` request for an unallocated server, metal-bmc performs:

// FIXME

1. Mount the metal-hammer ISO via BMC virtual media (HTTP/HTTPS/NFS source or pre-stored on BMC)
2. Configure one-shot boot to CD-ROM
3. Power on (or reset if already running)

**Dell iDRAC 9 example** (preferred vendor for automation maturity):

```bash
# Point iDRAC at ISO URL, set one-shot CD boot
racadm serverbios config -s Boot.Seq.0 -v UefiTarget,CD
racadm serverbios bootset oneboot cd
# Mount ISO from remote HTTP source
racadm virtualmedia config -s 1 -u http://metal-bmc/iso/metal-hammer.iso
```

**Supermicro XCC example** (manageable via IPMI + Redfish):

```bash
# One-shot CD boot
ipmitool chassis bootdev cdrom --period=once
# Virtual media mount via Redfish
# (requires iLO/XCC web session or curl against Redfish API)
```

#### Key difference from PXE

The ISO is not stored on the TFTP server reachable via broadcast. It is fetched by the BMC's management processor directly, making the UEFI firmware stack the entity that initiates IPv6 networking — not an iPXE script running in RAM.

#### UEFI IPv6 Stack

Modern server UEFI firmwares (2018+) include an IPv6 network stack:

- **Dell iDRAC 9**: `racadm set NIC.UEFIEthernetNetworkStack IPv6` + `racadm set NIC.UEFIEthernetDHCPv6 Dhcpv6Enable`
- **HPE iLO 5**: Native IPv6, `ilo-set` commands for configuration
- **Supermicro XCC**: Configured via IPMI OEM commands or pre-applied BIOS templates (set once per server, persist in NVRAM)

The ISO itself runs a standard Linux kernel, so the UEFI NIC stack is only used for the initial network configuration phase. Once the kernel boots and the initrd takes over, standard Linux IPv6 networking (`sysctl net.ipv6.*`) handles all subsequent traffic.

### 3.3 Leaf Switch Configuration (SONiic VRF + RAs)

#### VRF Creation and Port Binding

Each partition gets its own VRF for boot isolation:

```bash
# Create VRF for a partition's boot network
ip link add name VrfBoot-<partition-id> type vrf table <table-id>

# Assign all server-facing ports to the VRF (no VLAN tagging)
for port in Ethernet0 Ethernet4 Ethernet8 Ethernet12; do
    config vrf bind VrfBoot-<partition-id> $port
done

# Configure L3 interface address on the VRF
ip addr add 2001:db8:<partition>::1/64 dev VrfBoot-<partition-id>
ip link set VrfBoot-<partition-id> up
```

After binding, ports behave as plain access ports within the VRF's Layer 3 domain. No 802.1Q tags, no trunking.

#### Router Advertisement Configuration

RAs are sent from the VRF's L3 interface to prefix the server-facing subnets:

```bash
# Enable IPv6 forwarding
sysctl -w net.ipv6.conf.VrfBoot-<partition-id>.forwarding=1

# Configure radvd or kernel RAs for prefix advertisement
# Using kernel RAs (iproute2):
ip -6 route add 2001:db8:<partition>::/64 dev VrfBoot-<partition-id>
sysctl -w net.ipv6.conf.VrfBoot-<partition-id>.accept_ra=0
sysctl -w net.ipv6.conf.VrfBoot-<partition-id>.proxy_ndp=1

# Using radvd (/etc/radvd.conf):
# interface VrfBoot-<partition-id> {
#     AdvSendAdvert on;
#     MinRtrAdvInterval 3;
#     MaxRtrAdvInterval 10;
#     prefix 2001:db8:<partition>::/64 {
#         AdvOnLink on;
#         AdvAutonomous on;
#         AdvValidLifetime 3600;
#         AdvPreferredLifetime 1800;
#     };
# };
```

**Important**: DHCPv6 is not required. The RA provides the prefix, valid lifetime, and on-link flag. Servers generate their own addresses via SLAAC. DNS and other optional parameters can be pushed via DHCPv6 Information-Request (stateless DHCPv6) if needed, but are not required for basic operation.

#### BGP / Route Distribution

Routes learned in the boot VRF must be reachable from the metal-api (in the pod network). Two approaches:

- **Option 1 — Route leaking (recommended for small-to-medium deployments)**: Configure FRR BGP to redistribute VRF routes into the globalRouting VRF:

  ```bash
  # In FRR config on SONiC:
  router bgp <AS>
   vrf VrfBoot-<partition-id>
    address-family ipv6 unicast
     redistribute connected
    exit-address-family
   address-family ipv6 unicast
    redistribute vrf VrfBoot-<partition-id>
   exit-address-family
  ```

- **Option 2 — Static routes per partition**: For simple deployments, add static routes in the pod network pointing to the leaf switch's VRF interface address.

### 3.4 pixie-core Proxy on VRF

The existing pixie-core service runs on leaf switches and provides the switch-MAC-to-port mapping that metal-hammer needs. The only change: pixie-core binds to the VRF interface instead of the VLAN interface.

```go
// Bind to the VRF interface for a partition
vrfInterface := fmt.Sprintf("VrfBoot-%s", partitionID)
// pixie-core listens on the VRF's link-local or ULA address
listenAddr := fmt.Sprintf("[%s%%%s]:%s", "::1", vrfInterface, "18090")
conn, err := net.Listen("tcp", listenAddr)
```

All existing pixie-core logic (switch MAC lookup, metal-api proxy, machine registration) remains unchanged. The VRF simply replaces the VLAN as the delivery mechanism.

### 3.5 metal-hammer in the ISO

metal-hammer's behavior in ISO-boot mode:

1. **Boot** — Kernel and initrd load from ISO, metal.config is parsed
2. **Wait for IPv6** — The initrd waits until a non-link-local IPv6 address appears on the primary NIC (from SLAAC via RA)
3. **Contact pixie-core** — Connects to pixie-core over the VRF-local interface to obtain switch topology information (port, chassis MAC)
4. **Contact metal-api** — Reports hardware inventory, waits for allocation
5. **Provision** — Downloads target image, writes to disk, kexecs into the installed OS
6. **Detach ISO** — metal-bmc unmounts the ISO and resets boot device to hard disk

The critical difference from PXE: step 2 uses SLAAC-triggered IPv6 instead of DHCP-replied IPv4. metal-hammer's existing code path for detecting network readiness is extended to wait for a global IPv6 address on any NIC:

```go
// Simplified: wait for SLAAC address via RA
waitGlobalIPv6(interfaceName) {
    timeout := 30 * time.Second
    started := time.Now()
    for time.Since(started) < timeout {
        addrs, _ := net.InterfaceAddingrs(addrs)
        for _, a := range addrs {
            if ip, ok := a.(*net.IPNet); ok && !ip.IP.IsLinkLocalUnicast() && !ip.IP.IsLoopback() {
                return ip.IP
            }
        }
        time.Sleep(500 * time.Millisecond)
    }
    return nil
}
```

---

## 4. Boot Sequence

### 4.1 Discovery Boot Flow

```raw
         metal-bmc              leaf switch                    metal-api/pixie-core
            │                        │                             │
            │  1. Mount ISO          │                             │
            │  2. One-shot CD boot → │                             │
            │                        │                             │
   server───┤                        │                             │
            │                        │                             │
            │  3. UEFI boots ISO     │                             │
            │  4. Kernel + initrd    │                             │
            │  5. NIC receives RA    │───── multicast ff02::1 ────│ (solicited)
            │     generates SLAAC    │                             │
            │     IPv6 (global)      │                             │
            │                        │                             │
            │  6. metal-hammer       │                             │
            │     waits for global   │                             │
            │     IPv6               │                             │
            │  7. Contacts metal-    │─── HTTP /machines ─────────>│
            │     core (VRF-local)   │<── switch topology ────────│
            │  8. Reports HW info    │─── HTTP /machines ─────────>│
            │     to metal-api       │<── allocation / wait ──────│
            │  9. Downloads image    │─── HTTPS /images ─────────>│
            │ 10. Writes to disk     │                             │
            │ 11. kexec into OS      │                             │
            │                        │                             │
            │ 12. metal-bmc          │                             │
            │     detaches ISO       │                             │
            │     reboots → disk     │                             │
```

### 4.2 Re-Install Flow (analogous to MEP-3)

A re-install follows the same path but is triggered by calling the `/machine/reinstall` endpoint:

1. metal-api sets `allocation.reinstall = true`
2. metal-bmc triggers ISO boot (same as discovery)
3. Upon reaching metal-api, metal-hammer detects the `reinstall` flag
4. Disk wipe is limited to the root disk only; all data disks are preserved
5. Target image is flashed, kexec'd, ISO detached

---

## 5. Advantages Over PXE

| Aspect                     | PXE (current)                          | RA+SLAAC (proposed)                         |
|----------------------------|----------------------------------------|---------------------------------------------|
| Switch port config         | Per-port VLAN on trunk                 | Access port in VRF, no VLAN tag             |
| IP acquisition             | DHCP broadcast server state            | Stateless RAs, zero server state            |
| DHCP infrastructure        | TFTP server + DHCP server + relay      | None                                        |
| Boot media                 | iPXE from TFTP (broadcast)             | ISO from BMC virtual media (unicast)        |
| MAC-to-network mapping     | MAC → VLAN lookup (complex)            | MAC → physical port → VRF (trivial)         |
| VLAN limit                 | Consumes 1 of 4096 VLANs per partition | No VLANs consumed                           |
| Broadcast dependency       | Yes (DHCP Discover / PXE)              | No (RAs are L2 multicast, contained in VRF) |
| Boot isolation             | L2 (VLAN)                              | L3 (VRF), isolates broadcast domains better |
| Switch config complexity   | High per-port                          | Low bulk VRF binding                        |
| BMC capabilities leveraged | Minimal                                | Virtual media, one-shot boot                |

---

## 6. Implementation Phases

### Phase 1: ISO and KVM Testing

- Build metal-hammer ISO with UEFI GRUB bootloader
- Test boot in QEMU/KVM with OVMF (UEFI firmware) and virtio networking
- Verify kernel boots, initrd runs, and metal-hammer reports hardware
- Test SLAAC address acquisition with a simple Linux router sending RAs

### Phase 2: Vendor Boot Automation

- Implement `ConfigureIsoBoot` and `DetachIso` in metal-bmc for Dell and Supermicro first
- Validate one-shot CD boot via racadm (Dell) and ipmitool (Supermicro)
- End-to-end test: metal-bmc triggers ISO boot → server acquires SLAAC IPv6 → metal-hammer discovers itself

### Phase 3: Switch VRF + RA

- Implement VRF provisioning and port binding in pixie-core for SONiC
- Deploy radvd or kernel RA generation on leaf switch VRF interfaces
- Test RA propagation: server boots, receives RA, generates global IPv6 via SLAAC
- Validate pixie-core is reachable on the VRF interface

### Phase 4: End-to-End Integration

- Full pipeline test: unallocated server → metal-bmc ISO boot → SLAAC → metal-hammer discovery → allocation → image provision → kexec
- Validate dual-stack: both pixie-core (VRF) and metal-api (via route leaking) reachable
- Test reinstall flow with `allocation.reinstall = true`

### Phase 5: Migration and Rollout

- Deploy VRFs in new partitions first
- Operate dual-boot mode (PXE for some partitions, VRF+RA for others)
- Gradually migrate existing partitions
- Decommission PXE/Pixiecore/TFTP infrastructure

---

## 7. Open Questions and Risks

### 7.1 Vendor UEFI IPv6 Stack Variability

**Risk**: Not all BMC vendors support UEFI IPv6 configuration programmatically from the management controller.

| Vendor         | ISO mount            | UEFI IPv6 config             | One-shot boot      |
|----------------|----------------------|------------------------------|--------------------|
| Dell iDRAC 9   | HTTP/HTTPS/NFS URL   | Full (racadm)                | Full (racadm)      |
| HPE iLO 5      | HTTP/HTTPS           | Partial (ilo-set)            | Partial            |
| Supermicro XCC | HTTP/HTTPS (Redfish) | OEM IPMI raw / BIOS template | Partial (ipmitool) |
| Fujitsu iRMM5  | HTTP/HTTPS           | Minimal                      | Limited            |
| Gigabyte GMC   | HTTP/HTTPS           | None documented              | Limited            |

**Mitigation**: Dell and Superfirst as priority vendors. For others, UEFI IPv6 can be configured once during initial server setup (via web UI or physical access) and persists in NVRAM across reboots. Once configured, the one-shot boot + SLAAC flow works for all subsequent boots.

### 7.2 Metal-API HTTPS in ISO Environment

metal-hammer still needs to reach the metal-api over HTTPS. In the PXE world, pixie-core proxies this on the switch side to avoid cert distribution. The same approach works with VRF:

- metal-hammer connects to pixie-core via HTTP on the local VRF interface
- pixie-core proxies to metal-api over HTTPS with proper CA certificates
- No CA certificates distributed into the ISO

### 7.3 BMC Storage for ISO

The ISO must be accessible to BMCs. Options, from simplest to most complex:

1. **HTTP URL to ISO**: metal-bmc serves the ISO via HTTP; BMC fetches it over HTTP/HTTPS. Bandwidth: ~50MB per boot.
2. **Pre-stored on BMC**: Metal-bmc uploads ISO to BMC local flash (~4GB capacity limit on many controllers). One upload, many boots.
3. **NFS mount**: BMC mounts ISO from an NFS share. Fast but requires NFS server.

**Recommendation**: Start with HTTP URL (Option 1) — simplest to implement and test.

### 7.4 Boot Order After kexec

After successful kexec into the installed OS, the next reboot must NOT boot from ISO again:

- Dell iDRAC 9: one-shot boot resets to normal boot order automatically
- Supermicro: metal-bmc resets boot device to `harddisk` via `ipmitool chassis bootdev disk` after confirming kexec success
- For all vendors: metal-bmc tracks boot state and only sets CD as boot device when `discover` or `reinstall` is needed

### 7.5 Route Distribution from VRF to Pod Network

The boot VRF is an isolated routing domain. Routes from it (specifically, the addresses of booted servers and the pixie-core proxy) must reach the metal-api.

**Recommendation**: FRR BGP route leaking between VRFs on the switch, as described in §3.3. For deployments without FRR, static routes per partition are sufficient if the number of partitions is manageable.

### 7.6 RA Periodicity and Server Visibility

RAs are sent every 3–10 seconds (configurable via `MinRtrAdvInterval`/`MaxRtrAdvInterval`). If the switch rebooted, servers must re-initiate SLAAC. Most Linux kernels re-request a RA automatically, but the initial boot (firmware-level) only processes the first RA received. This is sufficient because:

- The switch VRF interface comes up before the server boots
- The first RA triggers immediate address generation
- Servers that come up later (e.g., after a failure) will receive periodic RAs

### 7.7 IPv6-Only Constraint

This proposal requires IPv6 on all boot networks. For sites without IPv6, a fallback mechanism would be needed (e.g., DHCPv4 in the VRF). This is out of scope for the initial implementation.

---

## 8. Appendix: QEMU Test Setup

A minimal test environment without real hardware or BMCs:

```bash
#!/bin/bash
# Test metal-hammer ISO with QEMU
ISO=metal-hammer-initrd.iso

qemu-system-x86_64 \
  -enable-kvm \
  -m 4096 \
  -smp 4 \
  -cdrom "$ISO" \
  -drive format=raw,file=disk.raw,size=100G \
  -net nic,model=virtio \
  -net user,hostfwd=tcp::8080-:80,hostfwd=tcp::443-:443 \
  -serial stdio \
  -bios /usr/share/OVMF/OVMF_CODE.fd \
  -global driver=cfi.pflash01,property=secure,value=off
```

The `-net user` mode provides NAT-based networking with DHCP and DNS — equivalent to the VRF in production. For testing SLAAC specifically, replace `-net user` with a TAP interface and run radvd on the host:

```bash
# Host side: TAP + RA
ip tuntap add dev tap0 mode tap
ip addr add 2001:db8:test::1/64 dev tap0
ip link set tap0 up
sysctl -w net.ipv6.conf.tap0.forwarding=1
sysctl -w net.ipv6.conf.tap0.accept_ra=0

# radvd config:
# interface tap0 {
#     AdvSendAdvert on;
#     prefix 2001:db8:test::/64 {
#         AdvOnLink on;
#         AdvAutonomous on;
#     };
# };
radvd -C /etc/radvd.conf &

# Run QEMU with TAP:
# -net nic,model=virtio -net tap,ifname=tap0,script=no
```

This provides a realistic test of SLAAC address acquisition before touching real BMCs or switches.
