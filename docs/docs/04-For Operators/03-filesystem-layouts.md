# Metal-API Filesystem Module Documentation

## Overview

This documentation covers the filesystem management module in the metal-api project, specifically the `filesystem.go` and `filesystem_test.go` files located in `cmd/metal-api/internal/metal/`.

The filesystem module manages filesystem layout definitions and configurations for machines provisioned through the metal-stack platform. It handles disk partitioning schemes, filesystem types, and storage configurations that are applied during machine provisioning.

## Module Location

```bash
metal-api/
└── cmd/
    └── metal-api/
        └── internal/
            └── metal/
                ├── filesystem.go
                └── filesystem_test.go
```

## Purpose

The filesystem module provides:

1. **Filesystem Layout Definitions**: Structures and types for defining how disks should be partitioned and formatted
2. **Validation Logic**: Ensures filesystem configurations are valid and safe
3. **CRUD Operations**: Create, Read, Update, Delete operations for filesystem layouts
4. **Integration**: Connects with the metal-api's REST endpoints and database layer

## Core Concepts

### Filesystem Layout

A filesystem layout defines how storage devices on a machine should be configured, including:

- **Partition schemes**: How to divide physical disks
- **Filesystem types**: ext4, xfs, btrfs, etc.
- **Mount points**: Where filesystems should be mounted
- **RAID configurations**: Optional RAID levels for redundancy
- **LVM configurations**: Logical volume management setups

### Use Cases

- **Operating System Installation**: Define root, boot, and swap partitions
- **Data Storage**: Configure separate data volumes
- **Container Runtime**: Optimize storage for containerized workloads
- **Database Workloads**: Configure storage for high-performance databases

## Data Structures

### FilesystemLayout

The primary structure representing a filesystem configuration:

```go
type FilesystemLayout struct {
    Base                   // Embedded base structure with ID, timestamps
    ID          string     // Unique identifier
    Name        string     // Human-readable name
    Description string     // Detailed description
    Filesystems []Filesystem // List of filesystem definitions
    Disks       []Disk     // Disk configuration
    Raid        []Raid     // RAID configurations
    VolumeGroups []VolumeGroup // LVM volume groups
    LogicalVolumes []LogicalVolume // LVM logical volumes
    Constraints Constraints // Validation constraints
}
```

### Filesystem

Defines an individual filesystem within a layout:

```go
type Filesystem struct {
    Path       string // Mount point (e.g., "/", "/boot", "/var")
    Device     string // Device or logical volume
    Format     string // Filesystem type (ext4, xfs, etc.)
    Label      string // Filesystem label
    CreateOptions []string // mkfs options
    MountOptions  []string // Mount options
}
```

### Disk

Represents physical disk configuration:

```go
type Disk struct {
    Device     string // Device path (e.g., "/dev/sda")
    Partitions []Partition // Partition definitions
    WipeOnReinstall bool // Whether to wipe during reinstall
}
```

### Partition

Individual partition within a disk:

```go
type Partition struct {
    Number int64  // Partition number
    Label  string // Partition label
    Size   uint64 // Size in bytes (0 for remaining space)
    GPTType string // GPT partition type GUID
    GPTGuid string // Partition GUID
}
```

## API Operations

### List Filesystem Layouts

Retrieves all available filesystem layouts:

```go
func (r *resource) listFilesystemLayouts() ([]*FilesystemLayout, error)
```

**Endpoint**: `GET /v1/filesystemlayout`

**Response**:

```yaml
- id: default
  name: Default Layout
  description: Standard single-disk layout
  filesystems:
    - path: /
      device: /dev/sda1
      format: ext4
  disks:
    - device: /dev/sda
      partitions:
        - number: 1
          size: 0
          label: root
```

### Get Filesystem Layout

Retrieves a specific filesystem layout by ID:

```go
func (r *resource) getFilesystemLayout(id string) (*FilesystemLayout, error)
```

**Endpoint**: `GET /v1/filesystemlayout/{id}`

### Create Filesystem Layout

Creates a new filesystem layout:

```go
func (r *resource) createFilesystemLayout(fsl *FilesystemLayout) (*FilesystemLayout, error)
```

**Endpoint**: `POST /v1/filesystemlayout`

**Request Body**:

```yaml
id: custom-layout
name: Custom Layout
description: Custom filesystem configuration
filesystems:
  - path: /
    device: /dev/sda1
    format: ext4
disks:
  - device: /dev/sda
    partitions:
      - number: 1
        size: 0
        label: root
```

### Update Filesystem Layout

Updates an existing filesystem layout:

```go
func (r *resource) updateFilesystemLayout(fsl *FilesystemLayout) (*FilesystemLayout, error)
```

**Endpoint**: `PUT /v1/filesystemlayout/{id}`

### Delete Filesystem Layout

Deletes a filesystem layout:

```go
func (r *resource) deleteFilesystemLayout(id string) (*FilesystemLayout, error)
```

**Endpoint**: `DELETE /v1/filesystemlayout/{id}`

### Try Filesystem Layout

Validates a filesystem layout without persisting it:

```go
func (r *resource) tryFilesystemLayout(fsl *FilesystemLayout) ([]ValidationError, error)
```

**Endpoint**: `POST /v1/filesystemlayout/try`

This allows users to test their configurations before committing them.

## Common Filesystem Layouts

### Default Single Disk

Standard layout for machines with a single disk:

- **Boot Partition**: 512MB, ext4, mounted at /boot
- **Root Partition**: Remaining space, ext4, mounted at /
- **Swap**: Optional, based on memory size

### LVM-based Layout

Flexible layout using LVM:

- **Boot Partition**: 512MB, ext4, outside LVM
- **LVM Physical Volume**: Remaining space
- **Volume Group**: Contains all logical volumes
- **Logical Volumes**:
  - Root: 20GB, ext4, /
  - Var: 20GB, ext4, /var
  - Home: 20GB, ext4, /home
  - Data: Remaining space, xfs, /data

### RAID1 Layout

Redundant layout for two disks:

- **RAID1 for Boot**: Mirror across both disks
- **RAID1 for Root**: Mirror across both disks
- Provides redundancy for system critical partitions

## Integration with Metal-Stack

### Machine Provisioning

When a machine is allocated:

1. User specifies desired filesystem layout (or uses default)
2. Layout is validated against machine's actual hardware
3. Configuration is sent to metal-hammer (provisioning agent)
4. metal-hammer executes the partitioning and formatting
5. Machine boots into the configured system

### Image Compatibility

Filesystem layouts must be compatible with OS images:

- Image may require specific partition scheme
- Bootloader requirements (BIOS vs. UEFI)
- Minimum size requirements for root filesystem

### Size Constraints

The module respects constraints from:

- **Machine Size**: Hardware profiles define available storage
- **Image Requirements**: OS images specify minimum disk space
- **Partition Alignment**: Ensures proper sector alignment

## Configuration Examples

### Example 1: Simple Single Disk

```yaml
id: simple
name: Simple Layout
description: Basic single disk layout with root filesystem
filesystems:
  - path: /
    device: /dev/sda1
    format: ext4
disks:
  - device: /dev/sda
    partitions:
      - number: 1
        size: 0  # 0 means use remaining space
        label: root
```

### Example 2: With Separate Data Volume

```yaml
id: data-volume
name: Layout with Data Volume
description: Root and separate data volume configuration
filesystems:
  - path: /
    device: /dev/sda1
    format: ext4
  - path: /data
    device: /dev/sda2
    format: xfs
    mount_options:
      - noatime
disks:
  - device: /dev/sda
    partitions:
      - number: 1
        size: 53687091200  # 50GB in bytes
        label: root
      - number: 2
        size: 0  # Use remaining space
        label: data
```

### Example 3: LVM Configuration

```yaml
id: lvm-layout
name: LVM Layout
description: Flexible LVM-based layout with multiple logical volumes
filesystems:
  - path: /boot
    device: /dev/sda1
    format: ext4
  - path: /
    device: /dev/vg0/root
    format: ext4
  - path: /var
    device: /dev/vg0/var
    format: ext4
disks:
  - device: /dev/sda
    partitions:
      - number: 1
        size: 536870912  # 512MB for /boot
        label: boot
      - number: 2
        size: 0  # Remaining space for LVM
        label: lvm
volume_groups:
  - name: vg0
    devices:
      - /dev/sda2
logical_volumes:
  - name: root
    volume_group: vg0
    size: 21474836480  # 20GB
  - name: var
    volume_group: vg0
    size: 21474836480  # 20GB
```

### Example 4: Complete Layout with Boot and Swap

```yaml
id: complete-layout
name: Complete Layout
description: Full layout with boot, swap, and root partitions
filesystems:
  - path: /boot
    device: /dev/sda1
    format: ext4
    label: boot
    create_options:
      - -L boot
    mount_options:
      - defaults
  - path: /
    device: /dev/sda3
    format: ext4
    label: root
    create_options:
      - -L root
    mount_options:
      - defaults
      - noatime
disks:
  - device: /dev/sda
    wipe_on_reinstall: true
    partitions:
      - number: 1
        size: 1073741824  # 1GB for /boot
        label: boot
        gpt_type: 0FC63DAF-8483-4772-8E79-3D69D8477DE4  # Linux filesystem
      - number: 2
        size: 8589934592  # 8GB for swap
        label: swap
        gpt_type: 0657FD6D-A4AB-43C4-84E5-0933C84B4F4F  # Linux swap
      - number: 3
        size: 0  # Remaining space for root
        label: root
        gpt_type: 0FC63DAF-8483-4772-8E79-3D69D8477DE4  # Linux filesystem
```

### Example 5: RAID1 Mirror Configuration

```yaml
id: raid1-layout
name: RAID1 Mirror Layout
description: Redundant layout with RAID1 across two disks
filesystems:
  - path: /boot
    device: /dev/md0
    format: ext4
  - path: /
    device: /dev/md1
    format: ext4
disks:
  - device: /dev/sda
    wipe_on_reinstall: true
    partitions:
      - number: 1
        size: 1073741824  # 1GB
        label: boot-a
      - number: 2
        size: 0  # Remaining
        label: root-a
  - device: /dev/sdb
    wipe_on_reinstall: true
    partitions:
      - number: 1
        size: 1073741824  # 1GB
        label: boot-b
      - number: 2
        size: 0  # Remaining
        label: root-b
raid:
  - name: md0
    level: 1  # RAID1
    devices:
      - /dev/sda1
      - /dev/sdb1
  - name: md1
    level: 1  # RAID1
    devices:
      - /dev/sda2
      - /dev/sdb2
```

### Example 6: Advanced LVM with Multiple Volume Groups

```yaml
id: advanced-lvm
name: Advanced LVM Layout
description: Complex LVM setup with multiple volume groups and thin provisioning
filesystems:
  - path: /boot
    device: /dev/sda1
    format: ext4
  - path: /
    device: /dev/vg-system/lv-root
    format: ext4
  - path: /var
    device: /dev/vg-system/lv-var
    format: ext4
  - path: /data
    device: /dev/vg-data/lv-data
    format: xfs
    mount_options:
      - noatime
      - nodiratime
disks:
  - device: /dev/sda
    wipe_on_reinstall: true
    partitions:
      - number: 1
        size: 1073741824  # 1GB
        label: boot
      - number: 2
        size: 107374182400  # 100GB
        label: system-pv
  - device: /dev/sdb
    wipe_on_reinstall: true
    partitions:
      - number: 1
        size: 0  # All space
        label: data-pv
volume_groups:
  - name: vg-system
    devices:
      - /dev/sda2
  - name: vg-data
    devices:
      - /dev/sdb1
logical_volumes:
  - name: lv-root
    volume_group: vg-system
    size: 32212254720  # 30GB
  - name: lv-var
    volume_group: vg-system
    size: 53687091200  # 50GB
  - name: lv-data
    volume_group: vg-data
    size: 0  # Use all available space
```

## Troubleshooting

### Common Issues

**Issue**: Layout validation fails with "root filesystem required"

- **Solution**: Ensure a filesystem with path="/" is included

**Issue**: Partition size exceeds disk capacity

- **Solution**: Check total partition sizes don't exceed available space

**Issue**: LVM volumes not found during provisioning

- **Solution**: Verify volume group and logical volume names match exactly

**Issue**: Boot fails after provisioning

- **Solution**: Ensure /boot is on a partition accessible by bootloader

## API Client Examples

### Using metalctl

```bash
# List all filesystem layouts
metalctl filesystemlayout list

# Get specific layout
metalctl filesystemlayout describe default

# Create new layout from file
metalctl filesystemlayout create -f my-layout.yaml

# Test layout without saving
metalctl filesystemlayout try -f my-layout.yaml

# Update existing layout
metalctl filesystemlayout update -f updated-layout.yaml

# Delete layout
metalctl filesystemlayout delete custom-layout
```

