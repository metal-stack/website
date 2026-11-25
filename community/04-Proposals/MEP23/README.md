---
slug: /MEP-23-stateful-machine-reinstall
title: MEP-23
sidebar_position: 23
---

# Stateful Machine Reinstall

:::info
This document is work in progress.
This MEP depends on [MEP-22](../MEP22/README.md) and replaces the reinstall part of MEP-3.
:::

A machine in metal-stack gets a new operating system image in exactly one way today: the machine is freed, every disk is wiped, and a new machine is allocated.
For machines that only run stateless workloads this is the right behavior.
For machines that carry data on local disks it means that every OS image update destroys that data.

This hits Kubernetes clusters hardest.
Gardener replaces worker nodes routinely: for OS image updates, Kubernetes minor updates and credential rotations.
On metal-stack each of these replacements is a full wipe of all disks of the machine.
Local storage such as Rook/Ceph OSDs or csi-driver-lvm volumes survives only through replication and a rebuild, and the node roll does not wait for that rebuild.
Operators end up pacing node rolls by hand, migrating data off each node before it is replaced.

[MEP-3](../MEP3/README.md) addressed this with a machine reinstall that kept data disks.
It was not carried over to the V2 API, and the metal-hammer no longer contains the reinstall path.
This MEP proposes to bring the capability back in a form that is safe by construction:

- A machine with an allocation can be **reinstalled**: the metal-hammer wipes the system disk, installs the requested image and boots it, exactly like a first installation. All other disks are left untouched. The allocation, and with it the machine ID, hostname, networks and IPs, stays as it is.
- The disks a filesystem layout resolved to at the first installation ([MEP-22](../MEP22/README.md)) act as **pins**: a reinstall acts on the same physical disks and never on a guess.
- The metal-hammer **fails closed**: it never wipes all disks of a machine that has an allocation.

## Terminology

The terms below are used throughout this document.
The Gardener terms are the ones Gardener already uses ([GEP-31](https://github.com/gardener/enhancements/tree/main/geps/0031-inplace-node-updates)), extended by one distinction that Gardener does not make yet.

| Term                   | Meaning                                                                                                                                                                                              |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| System disk            | The disk (or disks, for a mirrored setup) that holds the operating system. Wiped and rewritten by every installation and every reinstall.                                                             |
| Data disk              | Any other disk of the machine. Wiped when the machine is freed, never by a reinstall.                                                                                                                 |
| Machine reinstall      | The metal-stack operation proposed here: a fresh installation of an image onto the system disk of an allocated machine, keeping the allocation and the data disks.                                    |
| Disk pin               | The hardware identity of a resolved disk as recorded in the allocation by MEP-22 (WWID, with a fallback), in its role during a reinstall.                                                             |
| Rolling update         | Gardener: a node is updated by creating a new machine and deleting the old one. On metal-stack the old machine is freed and wiped.                                                                    |
| In-place update        | Gardener: a node is updated while its `Machine` and `Node` objects are kept.                                                                                                                          |
| In-place self-update   | An in-place update in which the running operating system updates itself, for example with `gardenlinux-update`. This is the only kind of in-place OS update Gardener implements today.                 |
| In-place reinstall     | An in-place update in which the infrastructure reinstalls the operating system on the same machine. From Gardener's view the node keeps its identity, from metal-stack's view it is a machine reinstall. |

Both kinds of in-place update keep the node and its data disks.
They differ in who performs the OS update: the node itself, or the infrastructure underneath it.

## Why Reinstall Instead of Self-Update

There are two ways to keep local data across an OS update: let the operating system update itself, or let metal-stack reinstall the operating system.
This MEP deliberately chooses the reinstall.

**The result is a known state.**
After a reinstall the system disk contains the published image and what the installer wrote, nothing else.
There is no configuration drift from earlier versions, no leftover package, no file that an administrator or an attacker changed months ago.
A self-updated node is the sum of its history, and that history differs from node to node.
Gardener ran into this with Garden Linux major version jumps and now wipes the `/etc` overlay during a self-update to get back to a defined state ([gardener#14457](https://github.com/gardener/gardener/issues/14457)).
A reinstall gives that guarantee for the whole operating system.
It also removes anything that persisted on the system disk after a compromise.
It does not clean data disks or firmware, and it does not claim to.

**It does not depend on the health of the node.**
A self-update needs a working operating system: a running update tool, free disk space, a reachable update source.
An operating system that is broken cannot repair itself.
A reinstall needs the BMC and the provisioning network, which metal-stack already depends on for every machine.
The same operation that updates a healthy node therefore also repairs a broken one: reinstalling the current image is a valid request.

**There is one code path.**
A reinstall runs the same metal-hammer installation that every new machine goes through.
A node that was reinstalled is indistinguishable from a node that was newly provisioned with the same image, apart from its data disks.
That path is exercised on every allocation in every partition, which makes it the best tested path metal-stack has.
A self-update is a second way to arrive at a version, with its own failure modes.

**It works for every operating system.**
A self-update requires an operating system built for it: an A/B partition scheme or an image-based update tool, plus an update source that the nodes can reach.
That limits the choice of operating system.
A reinstall works for every image metal-stack can install, including a jump across major versions or a change of distribution.

**The API tells the truth.**
The image of an allocation is the image that is on the disk, because metal-stack put it there.
MEP-3 already named this as a drawback of self-updates: the API does not learn about them.
For the same reason a reinstall can be reconciled: the desired image is part of the allocation, and requesting it again is idempotent.

**It is fast enough.**
A self-update ends in a reboot as well, so both approaches pay for the firmware initialization of the server, which dominates on most hardware.
The reinstall adds the boot of the metal-hammer and the image installation, and skips the secure erase of all disks that makes a free slow.
A complete allocation, from request to a node that joined its cluster, takes about two minutes on the hardware we tested.
We expect a reinstall to be in the same range and will measure it as part of the implementation.

The price is stated just as plainly:

- A failed reinstall cannot fall back to the previous operating system. See [Non-Goals](#non-goals).
- Everything on the system disk is lost: container image cache, logs, `emptyDir` volumes. Workloads on the node restart from scratch.
- The node is away for the duration of a full installation, not only for a reboot.

## Requirements

- A reinstall never touches a disk that is not a system disk of the allocation.
- A reinstall never acts on a disk that was picked by device name or by position.
- An unexpected boot into the metal-hammer never destroys data of an allocated machine.
- Freeing a machine still wipes all disks. Data never crosses from one allocation to the next.
- A defective system disk can be replaced without giving up the data disks of the machine.
- No changes to how images are built.

### Non-Goals

- **Fallback to the previous operating system.** A failed reinstall leaves the machine in a failed state from which the reinstall can be retried. Keeping the previous version bootable (A/B system disks or similar) can be added later and is explicitly not part of this MEP.
- **Keeping data across a free.** A freed machine is wiped completely, as today.
- **Changing an allocation beyond its image.** Networks, size, project and filesystem layout stay as they are. The user data can be replaced, see below.
- **Preserving parts of the system disk.** Preservation is per disk. A partition on the system disk does not survive.
- **Wiping data disks on request while the machine stays allocated.** Useful, but a separate feature.
- **Reinstalling firewalls.** A firewall keeps no data on its disks, so there is nothing a reinstall could preserve. Firewalls are updated by replacing them, as today, and the API rejects the reinstall of a firewall.

## Disks During a Reinstall

### System Disks and Data Disks

MEP-22 lets a filesystem layout select its disks by hardware properties and records in the allocation which physical disk every entry resolved to.
This MEP adds one field to a disk entry, `on_reinstall`, which states what a reinstall does to the disk:

- `preserve` (default): the disk is prepared by the first installation only. A reinstall leaves it alone and only restores mounts for filesystems the layout defines on it.
- `wipe`: the disk is wiped, partitioned and formatted by a reinstall, as by a first installation. This is what makes a disk a system disk.

```yaml
disks:
  - name: system
    match: disk.transport == "nvme" && disk.size < 600 * GiB
    on_reinstall: wipe
    partitions:
      # ...
  - name: ceph
    match: disk.transport == "nvme" && disk.size >= 1 * TiB
```

Destroying data is never the default.
A layout has to mark its system disk explicitly, and a layout without a disk marked `wipe` cannot be used for a reinstall.
The API rejects a layout whose root filesystem is on a disk that is preserved.
A layout that names its disks with `device` instead of a selector cannot be used for a reinstall either.

Disks that no entry of the layout matches are not touched by any installation, as today.
They are data disks as well, but nothing is recorded about them.
Declaring data disks in the layout, like `ceph` above, is recommended because it protects them during a system disk replacement, see below.

### Pins

A reinstall does not resolve selectors again.
It uses the disk identities that MEP-22 recorded in the allocation at the first installation, which thereby become pins:

- The pinned system disk is present: it is wiped and installed.
- The pinned system disk is gone: the pin is renewed as described in the next section, or the reinstall fails before anything is wiped.
- A pinned disk that is preserved is missing: the reinstall fails before anything is wiped, unless the request explicitly accepts the loss.

This is why the strict matching of MEP-22 and its opt-out `allow_multiple_matches` can coexist.
Two identical disks may take either role at the first installation, when both are empty.
Strict matching protects the moment a pin is created.
The pin protects everything after that.

### Replacing a System Disk

A system disk that died has to be replaced, and the machine should then be reinstalled rather than freed, because its data disks are the reason for all of this.
The replacement matches the same selector but has a different identity, so the pin cannot be met anymore.

The pin exists to protect the disks that are in the machine.
It has nothing to say about a disk that was added later.
A reinstall therefore renews the pin of a system disk on its own when the pinned disk is no longer part of the hardware inventory.
The selector of the entry is resolved again when the machine registers, under two additional rules:

- Disks that are pinned by other entries are not candidates.
- Only disks that were not part of the machine's hardware inventory at the last successful installation are candidates. A replacement disk is new to the machine by definition. An existing disk that no entry declares, for example an undeclared Ceph disk, can therefore never be picked up as the new system disk.

The usual selection applies to these candidates: exactly one must match, or the first one with `allow_multiple_matches`.
If that does not resolve, the reinstall fails before anything is wiped.
This covers a system disk that is merely not detected: no new disk shows up, so there is no candidate.

The pin is never renewed while the pinned disk is present, however broken it is.
A reinstall onto a disk that is detected but defective fails during the installation.
After the disk was swapped, requesting the reinstall again succeeds.

For the remaining cases, for example a replacement disk that was part of this machine before, the request can name the identity of the new system disk directly.
Pins of preserved disks are never renewed automatically.

## Machine Reinstall

### API

The `MachineService` of the V2 API gets a new call:

```proto
rpc Reinstall(MachineServiceReinstallRequest) returns (MachineServiceReinstallResponse)

message MachineServiceReinstallRequest {
  string uuid = 1;
  string project = 2;
  // Image to install. Defaults to the current image of the allocation.
  optional string image = 3;
  // Userdata replaces the userdata of the allocation if set.
  optional string userdata = 4;
  // Repin sets the pin of disk entries of the filesystem layout to a given disk identity.
  // Only needed when the pin of a replaced system disk cannot be renewed automatically.
  repeated DiskRepin repin = 5;
}
```

- The machine must have an allocation of type machine. Firewalls cannot be reinstalled.
- The allocation must have resolved disks. Allocations that were created before MEP-22, or with a layout that uses `device`, cannot be reinstalled.
- The image must be allowed by the filesystem layout of the allocation. The layout itself is not changed: the allocation already embeds a copy of it.
- Replacing the user data is needed by consumers that hand short-lived join credentials to a machine, such as Gardener.
- Requesting a reinstall for a machine that is already waiting for one, or whose last reinstall failed, starts it again. The call is idempotent.

The request marks the allocation as pending reinstall and brings the machine into the metal-hammer the same way a free does: the switch ports are moved to the provisioning network and the BMC is told to boot the metal-hammer once and to reset the machine.
After a successful installation the ports are moved back and the boot order is set to disk, as after a first installation.

### Relation to MEP-20

[MEP-20](../MEP20/README.md) changes how a machine reaches the metal-hammer: ISO or HTTP boot instead of PXE, and an IPv6 boot VRF instead of the PXE VLAN.
It keeps the provisioning sequence from the registration onwards, which is where this MEP makes its changes.
The two proposals therefore do not depend on each other, as long as the reinstall is defined as "enter the metal-hammer like a free does" and not in terms of PXE.

Two points need attention when both are implemented:

- metal-boot hands out the token a machine uses to talk to the metal-apiserver. It has to do so for an allocated machine with a pending reinstall.
- MEP-20 lets metal-bmc enforce the boot option of machines periodically and leaves machines that boot from disk alone. A machine with a pending reinstall has to be treated like a free machine there until its installation succeeded.

MEP-20 also removes a cost of the reinstall.
Today every reinstall moves the switch ports of a machine between a layer-2 and a layer-3 configuration and back, which is the part of provisioning that causes trouble on the switches.
With the boot VRF this becomes a change between two VRFs, and the ACLs of the boot VRF isolate a machine that is being reinstalled.

### metal-hammer

After registering, the metal-hammer decides what to do based on the allocation:

| Machine state                              | Behavior                                                                                         |
| :----------------------------------------- | :----------------------------------------------------------------------------------------------- |
| No allocation                              | Wipe all disks, wait for an allocation. Unchanged.                                               |
| Allocation, reinstall pending              | Verify the pins, wipe the system disks, install, report, boot the new operating system.          |

The destructive default applies only to machines without an allocation.
The reinstall of MEP-3 did not have that property: when the reinstall flag was lost on the way, the machine was wiped completely ([metal-api#207](https://github.com/metal-stack/metal-api/issues/207)).

An allocated machine without a pending reinstall is not supposed to reach the metal-hammer at all.
Its boot order puts the disk first, so a kernel panic or a power failure brings the installed system back.
Should it happen anyway, nothing changes compared to today: the metal-apiserver refuses the registration of an allocated machine (since v0.17.0), and the metal-hammer registers before it wipes, so nothing is wiped.
This MEP adds exactly one exception to that refusal, the pending reinstall.

During a reinstall, wiping means the same as during a free, restricted to the pinned system disks: a secure erase for NVMe devices, discard or overwrite for the others.

### Failure Handling

A reinstall that fails before the system disk is wiped leaves the machine as it was: the pending marker is removed, the old image stays in the allocation, and the machine boots its operating system again.

A reinstall that fails after the system disk was wiped leaves a machine without an operating system.
The metal-hammer reports the failure and stays up, it does not reboot in a loop.
The allocation is kept and shows the failed reinstall.
From there the reinstall can be requested again, with the same or with another image, or the machine can be freed.

### Affected Components

- **api**: `on_reinstall` on the disks of a filesystem layout, the `Reinstall` call, the reinstall state of an allocation, a provisioning event for a failed reinstall.
- **metal-apiserver**: the reinstall call including the renewal of pins, registration of a machine with a pending reinstall.
- **metal-hammer**: the decision table above, `on_reinstall` during the installation.
- **metal-bmc**, **metal-core**: no functional change expected, the reinstall uses the mechanisms of a free.
- **cli**: `machine reinstall`, display of the reinstall state.
- **metal-api (V1)**: no changes. The V1 reinstall endpoint no longer preserves data since the metal-hammer was migrated and should be disabled.

### Migration

Nothing changes for existing layouts and allocations.
Only allocations that were created with a layout that uses selectors and marks a system disk can be reinstalled.
An existing machine has to be allocated once more to become reinstallable.

## Gardener Integration

The reinstall is useful on its own, for example through the CLI or for Cluster API.
Its main consumer is expected to be Gardener, where it becomes the **in-place reinstall** defined above.
That work happens in the Gardener extensions of metal-stack and partly in Gardener itself, and is described here only as far as it shapes this MEP.

### Relation to GEP-31

[GEP-31](https://github.com/gardener/enhancements/tree/main/geps/0031-inplace-node-updates) describes in-place node updates for Gardener.
Its motivation is the one of this MEP: bare-metal machines boot slowly, their sanitization takes long, and their local disks cannot move to another machine.
GEP-31 has two halves, and the in-place reinstall relates differently to each of them.

**Orchestration: used as it is.**
The update strategies `AutoInPlaceUpdate` and `ManualInPlaceUpdate`, the fields in the `Shoot`, `Worker` and `MachineDeployment` APIs and the role of the machine-controller-manager stay unchanged.
The machine-controller-manager selects nodes within `maxUnavailable`, cordons and drains them, labels them `ready-for-update`, waits for `update-successful` or `update-failed` with a timeout, and uncordons.
The `Machine` and the `Node` are kept.
Nothing in this half assumes how the operating system gets updated.

**Execution: a second implementation.**
In GEP-31 the gardener-node-agent on the node performs the update.
For an OS image update it runs a command that the OS extension provides, and the operating system updates itself.
This is the in-place self-update of the [terminology](#terminology).
It cannot perform a reinstall, because the node agent is wiped together with the system disk.

| Step of GEP-31                                        | In-place self-update (GEP-31 today)                         | In-place reinstall (this MEP)                                                          |
| :---------------------------------------------------- | :---------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| Prerequisite                                          | The OS has an update tool and falls back to the old version | Any image metal-stack can install, no fallback                                         |
| Reacts to `ready-for-update`                          | gardener-node-agent on the node                             | A component outside the node, which requests the machine reinstall                     |
| OS image update                                       | The update command of the OS extension, then a reboot       | The metal-hammer installs the image                                                    |
| Node credentials                                      | Stay on the node                                            | Are lost, the node bootstraps again                                                    |
| Pods on the node                                      | Deleted by the node agent after the update                  | Gone with the system disk, recreated when the node is back                             |
| Reports `update-successful` or `update-failed`        | gardener-node-agent                                         | To be defined: the node agent after it bootstrapped again, or the requesting component |
| Failed update                                         | The old version boots again, in most cases                  | The "total failure" of GEP-31: the timeout marks the node as failed                    |
| Kubelet updates, configuration, credential rotation   | gardener-node-agent, without a reboot                       | Unchanged, a reinstall is only needed when the OS image changes                        |

GEP-31 can therefore be built on top of this MEP.
metal-stack has to provide what the reinstall call above already contains: the machine keeps its identity, the user data can be replaced, the call is idempotent, and its result is visible in the API.
The remaining work is on the Gardener side:

- gardener-extension-provider-metal supports only rolling updates today. It has to offer the in-place update strategies and to adopt the V2 API.
- A component outside the node has to request the reinstall once a node is labeled `ready-for-update`. GEP-31 has no such hook, it names the gardener-node-agent as the only executor. Whether this belongs into the machine-controller-manager and its provider, or into a controller of the provider extension, has to be decided with the Gardener maintainers.
- The reinstalled operating system has no credentials, so the node has to bootstrap again. Gardener refuses this today for a machine whose node already exists. A path to bootstrap a known machine again is needed and will be proposed there. It is the reason the reinstall call can replace the user data.
- The CloudProfile marks per image version whether in-place updates are supported and from which version on. Both express limits of a self-update. For an in-place reinstall every image qualifies.
- GEP-31 expects the operating system to fall back to the previous version when an update fails. An in-place reinstall cannot do that. A failed reinstall shows up as a failed in-place update of that node, which stops the rollout once `maxUnavailable` is reached and needs a retry of the reinstall.

Both kinds of in-place update can exist next to each other.
A provider whose operating system can update itself keeps using GEP-31 as it is, and nothing in this MEP changes Gardener for it.

## Alternatives Considered

- **In-place self-update.** See [Why Reinstall Instead of Self-Update](#why-reinstall-instead-of-self-update).
- **Keeping data disks across a free and allocating the same machine again.** This would need no bootstrap changes in Gardener. It was rejected because data would outlive its allocation, which weakens the guarantee that a freed machine is clean, and because it needs a reservation mechanism to make sure the machine returns to the same project.
- **Restoring the MEP-3 implementation.** Its preservation was implicit (disks that the layout did not mention), its disk identification relied on device names, and it wiped everything when the reinstall flag got lost.

## Open Questions

- Naming of `on_reinstall` and its values.
- Should a failed reinstall follow the convention of the metal-hammer, which reports `Crashed` and reboots after any error, and retry by itself? This document currently lets the metal-hammer stay up.
- Should an unexpected boot of an allocated machine into the metal-hammer raise a machine issue in addition to the provisioning event?

## Implementation Notes

Findings from reading the current code (metal-apiserver v0.17.0, metal-hammer at `6c0bc4b`), kept here until they move into issues.

- **Hardware inventory is written only at registration.** It never changes while a machine is allocated. The registration during a reinstall is the point where a replaced disk becomes visible.
- **Registration overwrites the stored hardware.** The allocation therefore needs its own list of disk identities from the last successful installation. Otherwise a failed reinstall followed by a retry no longer sees the replacement disk as new.
- **Registration recomputes the size of the machine.** A replacement disk of a different capacity can move an allocated machine to another or to an unknown size. The reinstall path needs a rule for this.
- **Registration of an allocated machine is refused** (`machine is allocated, register not possible`). The pending reinstall is the one exception to add. A failed first installation runs into the same refusal after its reboot.
- **A failing metal-hammer reports `Crashed` and reboots after five seconds.** The provisioning state machine accepts `Crashed` from every phase of the metal-hammer, including the installation.
- **The metal-hammer reports `InstallationSucceeded` also when the installation failed**, because the report is sent before the error is checked (`cmd/root.go`, `installImage`). A failed reinstall would be reported as a success. This regressed with the V2 migration ([metal-hammer#194](https://github.com/metal-stack/metal-hammer/pull/194)): [metal-hammer#190](https://github.com/metal-stack/metal-hammer/pull/190) had made the report carry the installation error, but the V2 call has no field for a failure. [metal-hammer#206](https://github.com/metal-stack/metal-hammer/pull/206) stops the metal-hammer from sending the report after a failed installation. The error text then reaches the metal-apiserver only through the `Crashed` event, a report that carries it needs an API change.
- **The trigger exists.** The BMC command `MACHINE_DELETED` sets the boot target and resets the machine, and the handling of a successful installation moves the switch ports back and sets the boot target to disk.
- **The provisioning state machine** already allows the transition from registering to installing without waiting.
