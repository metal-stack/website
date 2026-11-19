---
slug: /maintenance
title: Maintenance
sidebar_position: 4
---

## Update Policy

For features and breaking changes we create a new minor release of metal-stack.
Patch releases are almost only created in case of urgent security fixes or important backports.
Less critical bug fixes will ship with the next release.
The corresponding release notes are published along with the new version of metal-stack in the [releases repository](https://github.com/metal-stack/releases) according to the [release flow](../../community/05-release-flow.md).

For operators, it is important that every minor release is carried out **sequentially, without skipping versions**.
It is not strictly necessary to cycle through the patch releases.

:::important
Skipping minor versions may cause severe installation issues and should only be done if you are fully aware of what you are doing.
:::

:::info
Prior to metal-stack `v1.0.0`, some patch releases also contained breaking changes.
This practice has been discontinued and every metal-stack installation is now treated equally, regardless of the Kubernetes integration used.
:::

## Releases

Before upgrading your metal-stack installation, review the [release notes](https://github.com/metal-stack/releases/releases) carefully – they contain important information on required pre-upgrade actions and notable changes.
The release notes are available on GitHub, this website and additionally shared via a the `#announcements` channel in our community Slack.

Once you applied the required actions for a release, you can deploy a new metal-stack version by updating the `metal_stack_release_version` variable in your Ansible configuration and trigger the corresponding deployment jobs in your CI.

If you are using metal-stack in combination with Gardener and you do not run pre-production stages, we advise running some basic functional tests after upgrading metal-stack to ensure the installation is in a fully functional state (e.g. reconciling a bunch of shoot clusters with evaluation purpose, creating and deleting a shoot cluster).

### Machine Images

metal-stack offers prebuilt OS system images for firewalls and worker machines, which can be downloaded from `https://images.metal-stack.io`.
The build for the OS images is contained in the [metal-images repository](https://github.com/metal-stack/metal-images).
metal-images for firewalls and worker nodes follow independent release cycles, typically driven by the need for security patches or system updates.
When new images are made available, the machines must be re-provisioned to apply the updates.

When using metal-stack in a Kubernetes context, new machine images can be carried out through a rolling update of the cluster worker groups.

The worker nodes are rolled out one after the other and, if possible, the containers are redistributed to the machines that are still available.
However, for unclustered stateful workloads like databases, temporary disruptions may occur during node drain.

For firewall updates, the process works as follows: A new firewall node is provisioned and configured in parallel with the existing one.
Once setup is complete, traffic is switched over to the new node, and the old firewall is then decommissioned.
This minimizes disruption while ensuring a seamless transition.
Because all outbound traffic passes through a firewall machine, updating a firewall machine results in a short ingress traffic interruption for a maximum of 60 seconds.

In a Gardener setup, image updates can be triggered by referencing the new image in the shoot spec.

:::info
In offline or air-gapped setups, OS images must either be synced into the partition-local [image-cache](https://github.com/metal-stack/metal-image-cache-sync) after they were added to the metal-apiserver or be manually downloaded in advance and uploaded to your local S3-compatible storage.
Ensure that the image paths and metadata are correctly maintained so the system can retrieve them during provisioning.
:::

## Disaster Recovery

### Rollback

metal-stack employs forward-only database migrations (e.g., for RethinkDB), and each release undergoes thorough integration testing.
However, rollback procedures are not included in test coverage.
To maintain data integrity and system reliability, rolling back a full release is not supported and strongly discouraged.
In the event of issues after an upgrade, it is possible to downgrade specific components rather than reverting the entire system.

### Restoring Backups

The databases of the metal control plane are continuously backed up by the [backup-restore-sidecar](https://github.com/metal-stack/backup-restore-sidecar), which pushes the backups to S3-compatible object storage.
When a database starts up with an empty state, the sidecar automatically restores the most recent backup.
Restoring a specific backup point manually is also supported, see the [manual restore documentation](../08-References/Control%20Plane/backup-restore-sidecar/manual_restore.md).

The following table summarizes the recovery approach for common disaster scenarios:

| Scenario                    | Recovery Approach                                                                                                                                      |
| :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Control plane database loss | Restore the databases from the backups on the object storage, redeploy the control plane via CI/CD                                                     |
| Partition loss              | Rebuild the partition using the partition Ansible playbooks                                                                                            |
| Switch failure              | Mount a replacement switch and re-run the partition Ansible playbooks (the topology is redundant, so a single switch failure does not cause an outage) |

During recovery, the metal-stack version referenced in the deployment Git repository is deployed — not the latest release.
This ensures that the environment returns to its pre-outage state.
Operators trigger this redeployment manually through the CI pipeline.

Backup of local machine storage is not covered by metal-stack.
Machine/Disk failure will lead to data loss.
To mitigate this a clustered storage system can be used to replicate data across multiple machines in multiple failure domains (e.g. machines, racks, partitions).
In addition, we recommend automated and monitored backups and regular restore drills.

## Firmware Updates

Firmware updates are intentionally not part of the automated machine lifecycle, since firmware handling is too vendor-specific for stable automation.
Updating server firmware is an administrative task that must be performed manually by operators.
