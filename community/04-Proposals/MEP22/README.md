---
slug: /MEP-22-disk-selection-in-filesystem-layouts
title: MEP-22
sidebar_position: 22
---

# Disk Selection in Filesystem Layouts

:::info
This document is work in progress.
This MEP builds on the V2 API (MEP-4) and extends the filesystem layouts of MEP-8.
:::

A filesystem layout ([MEP-8](../MEP8/README.md)) names its disks by kernel device path, for example `/dev/nvme0n1`.
The hardware inventory of a machine contains the name and the size of each block device and nothing else.

Kernel device names are not stable.
NVMe devices are enumerated in probe order, and we have seen machines of identical hardware come back from an installation with the operating system on `nvme1n1`.
MEP-8 itself documents a size where the boot device "is always `/dev/sde`", which holds until it does not.

The consequences today:

- The operating system can end up on a disk that was meant for something else, for example on the large disk of a machine while the small one stays empty.
- A layout cannot describe a disk by what it is. "The small NVMe" or "the SATA-DOM" has to be translated into a device name that is assumed to be the same on every machine of a size.
- Workloads that claim disks themselves, such as Rook/Ceph, find the roles of the disks swapped from one installation to the next.
- Any feature that treats disks differently, such as keeping data disks during a reinstall ([MEP-23](../MEP23/README.md)), has nothing reliable to build on.

This MEP proposes:

- The metal-hammer reports stable hardware properties for every disk.
- Filesystem layouts identify disks with **selectors** on these properties instead of device names.
- A selector has to match exactly one disk unless the layout says otherwise.
- The disks a layout resolved to are recorded in the allocation by their hardware identity, and the metal-hammer installs onto exactly these disks.

## Hardware Inventory

The metal-hammer reports more properties for every block device:

| Property     | Example                                      |
| :----------- | :------------------------------------------- |
| `name`       | `/dev/nvme0n1` (as today, not stable)        |
| `size`       | `1920383410176`                              |
| `wwid`       | `eui.36434630544015070025384500000001`       |
| `serial`     | `S64GNE0T401507`                             |
| `model`      | `SAMSUNG MZQL21T9HCJR-00A07`                 |
| `transport`  | `nvme`, `sata`, `sas`, `usb`, `virtio`       |
| `rotational` | `false`                                      |
| `bus_path`   | `pci-0000:01:00.0-nvme-1`                    |

`wwid` is the identifier the Linux kernel exposes for a block device.
It is the common term across device types: for SATA and SAS disks it contains the World Wide Name (`naa.…`), for NVMe devices the EUI-64 or NGUID of the namespace (`eui.…`), which is not a WWN in the strict sense.
This document uses WWID throughout.

This is an additive change to `MachineBlockDevice` and useful on its own, for example for hardware audits.
The metal-hammer runs without udev, so these properties are read from sysfs, and the `/dev/disk/by-id` aliases known from installed systems are not available as a property.

## Selectors

A disk in a filesystem layout gets a `name` and a `match` expression.
The expression is written in [CEL](https://cel.dev/) and is evaluated once per disk of the machine, with the disk available as the variable `disk`.
This follows the approach of [Talos Linux](https://docs.siderolabs.com/talos/v1.14/configure-your-talos-cluster/storage-and-disk-management/disk-management/common), which went from device paths and a fixed set of match fields to CEL for the same reasons.

```yaml
disks:
  - name: system
    match: disk.transport == "nvme" && disk.size < 600 * GiB
    partitions:
      - number: 1
        label: efi
        size: 500
        gpttype: ef00
      - number: 2
        label: root
        size: 0
        gpttype: "8300"
  - name: ceph
    match: disk.transport == "nvme" && disk.size >= 1 * TiB
filesystems:
  - path: /boot/efi
    device: system/1
    format: vfat
  - path: /
    device: system/2
    format: ext4
```

The example is illustrative, the exact field names are open for discussion.
Four things matter:

- Other parts of the layout (filesystems, RAID, volume groups) refer to a disk by its `name` and a partition number, no longer by a device path.
- The expression is compiled and type-checked when the layout is created or updated. A typo in a field name is rejected by the API, not discovered during an installation.
- A disk entry without partitions, like `ceph` above, is valid. It declares a disk that the layout knows about and leaves raw.
- The existing `device` field keeps working, see [Migration](#migration).

Sizes are available to the expression as signed integers, together with constants such as `GiB` and `TiB`.
Exposing them unsigned, as they are stored, would force every expression to write `600u * GiB`, a trap the Talos documentation has to warn about.

## Resolving Selectors

The metal-apiserver resolves the selectors against the hardware inventory when a machine is allocated.
The metal-hammer does not evaluate expressions, it receives the result.

- Entries are resolved in the order in which they are listed. A disk that was claimed by an earlier entry is not a candidate for a later one.
- By default an entry must match **exactly one** candidate. No match and more than one match are both errors.
- An entry can opt out with `allow_multiple_matches: true`. Then the first candidate in a stable order (by WWID) is taken.

A layout that does not resolve on the selected machine fails the allocation, the same way a layout whose devices do not exist on the machine does today.

The strict default exists because first-match-wins is how an installation ends up on the wrong disk.
Talos takes the first match and has a [report](https://github.com/siderolabs/talos/issues/12370) of a data disk lost to exactly that.

The opt-out exists because some disks cannot be told apart by any expression: two identical disks, one for the operating system and one for data, or the two disks of a mirrored system disk.
This is harmless, because all disks of a machine are empty after the wipe that follows a free, and either one can take either role.

## Resolved Disks

The metal-apiserver stores in the allocation which physical disk every disk entry of the layout resolved to.
A disk is identified by its WWID, or by serial number and model for devices that do not report a WWID.

The metal-hammer receives these identities with the allocation and looks the disks up by them.
It does not rely on kernel device names anymore: the name a disk has during this boot is only used to run the installation.

Recording the result has two more benefits:

- The API shows which disk of a machine carries the operating system.
- The choice made for an entry with `allow_multiple_matches` is not lost. Whoever needs to know later which of two identical disks was taken can look it up.

## Affected Components

- **api**: additional block device properties, `name`, `match` and `allow_multiple_matches` on the disks of a filesystem layout, references by disk name, resolved disks in the allocation.
- **metal-apiserver**: validation of expressions, resolution of selectors at allocation.
- **metal-hammer**: extended hardware detection, disk lookup by identity before the installation.
- **cli**: display of the new properties and of the resolved disks.
- **mini-lab**: virtual disks need serial numbers so that they can be identified.

## Migration

Nothing changes for existing layouts and allocations.
A disk entry uses either `device` or `match`, and layouts that use `device` behave as today.
Selectors are opt-in per filesystem layout.

The additional hardware properties appear for a machine once it registered with a metal-hammer that reports them.

## Alternatives Considered

- **A fixed set of match fields instead of CEL** (size, model, transport). Simpler to implement, but every new hardware quirk needs an API change. Talos started there and moved to CEL.
- **Persistent device paths in the existing `device` field** (`/dev/disk/by-id/…`). These identify one specific disk, so a layout would be valid for a single machine and not for a size. The metal-hammer also has no udev that would create them.
- **First match wins.** See [Resolving Selectors](#resolving-selectors).

## Open Questions

- Naming and exact shape of the layout fields (`match`, `allow_multiple_matches`, the `system/2` references).
- Identity for devices without a WWID: is serial number and model sufficient, or is the bus path needed as a last fallback?
- Should hardware RAID volumes and the software RAID of a layout get special treatment, or is one identity per member disk enough?
- Should a machine on which the layout does not resolve be excluded from the candidates of an allocation, instead of failing the allocation? Today a machine is selected first and its layout is checked afterwards.
- Should a registered machine on which no layout of its size resolves raise a machine issue, so that operators see it before an allocation fails?

## Implementation Notes

Findings from reading the current code (metal-apiserver v0.17.0, metal-hammer at `6c0bc4b`), kept here until they move into issues.

- **Hardware inventory is written only at registration.** It never changes while a machine is allocated.
- **The metal-hammer has no udev.** ghw reads model, serial number, WWN and bus path from the udev database only, so these come back empty. The identity has to be read from sysfs (`/sys/block/<dev>/wwid`, `device/serial`, `device/model`).
- **The storage code of the metal-hammer works on device paths.** Resolved disks can be translated into the device paths of the current boot right before it runs, which leaves that code unchanged. The fstab and the bootloader already use filesystem UUIDs.
- **A machine is selected before its filesystem layout is checked.** A layout that does not match fails the allocation, it does not exclude the machine.
