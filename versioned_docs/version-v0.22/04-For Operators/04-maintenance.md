---
slug: /maintenance
title: Maintenance
sidebar_position: 4
---

## Update Policy

For new features and breaking changes we create a new minor release of metal-stack.
For every minor release we present excerpts of the changes in a corresponding blog article published on metal-stack.io.

It is not strictly necessary to cycle through the patch releases if you depend on the pure metal-stack components.
However, it is important to go through all the patch releases and apply all required actions from the release notes.
Therefore, we recommend to just install every patch release one by one in order to minimize possible problems during the update process.

In case you depend on the Gardener integration, especially when using metal-stack roles for deploying Gardener, we strongly recommend installing every patch release version.
We increment our Gardener dependency version by version following the Gardener update policy. Jumping versions may lead to severe problems with the installation and should only be done if you really know what you are doing.

:::info
If you use the Gardener integration of metal-stack do not skip any patch releases. You may skip patch releases if you depend on metal-stack only, but we recommend to just deploy every patch release one by one for the best possible upgrade experience.
:::

## Releases

Before upgrading your metal-stack installation, review the release notes carefully - they contain important information on required pre-upgrade actions and notable changes. These notes are currently shared via a dedicated Slack channel and are also available in the release on GitHub. Once you are prepared, you can deploy a new metal-stack version by updating the `metal_stack_release_version` variable in your Ansible configuration and trigger the corresponding deployment jobs in your CI.

metal-stack offers prebuilt system images for firewalls and worker machines, which can be downloaded from `images.metal-stack.io`. In offline or air-gapped setups, these images must either be synced into the partition-local [image-cache](https://github.com/metal-stack/metal-image-cache-sync) after they were added to the metal-api or be manually downloaded in advance and uploaded to your local S3-compatible storage. Ensure that the image paths and metadata are correctly maintained so the system can retrieve them during provisioning.
If you are using metal-stack in combination with Gardener and you do not run pre-production stages, we advise running some basic functional tests after upgrading metal-stack to ensure the installation is in a fully functional state (e.g. reconciling a bunch of shoot clusters with evaluation purpose, creating and deleting a shoot cluster).

metal-images for firewalls and worker nodes follow independent release cycles, typically driven by the need for security patches or system updates. When new images are made available, the machines must be re-provisioned to apply the updates. When using metal-stack in a Kubernetes context, this results in a rolling update of the cluster worker groups.
In a Gardener setup, image updates can be triggered by referencing the new image in the shoot spec.

Because all outbound traffic passes through the firewall node, this results in a short downtime of around 30 seconds. This interruption only occurs if the firewall image has actually changed. The process works as follows: a new firewall node is provisioned and configured in parallel with the existing one. Once setup is complete, traffic is switched over to the new node, and the old firewall is then decommissioned. This minimizes disruption while ensuring a seamless transition.

The worker nodes are rolled out one after the other and, if possible, the containers are redistributed to the machines that are still available. However, for unclustered stateful workloads like databases, temporary disruptions may occur during node restarts.

## Firmware Updates

Firmware updates are intentionally not part of the automated machine lifecycle, since firmware handling is too vendor-specific for stable automation. Updating server firmware is an administrative task that must be performed manually by operators. The corresponding API endpoints are restricted to admin users.

## Repurposing Hardware

metal-stack assumes a fully automated server landscape. Using servers managed by metal-stack for other purposes is not supported. To repurpose hardware, the machines have to be decommissioned, removed from the metal database and physically relocated out of the partition before they can be reused outside of metal-stack. When machines are decommissioned, metal-hammer wipes their disks to prevent data leakage.

## Rollback

metal-stack employs forward-only database migrations (e.g., for RethinkDB), and each release undergoes thorough integration testing. However, rollback procedures are not included in test coverage. To maintain data integrity and system reliability, rolling back a full release is not supported and strongly discouraged. In the event of issues after an upgrade, it is possible to downgrade specific components rather than reverting the entire system.

## Backup and Disaster Recovery

The databases of the metal control plane are continuously backed up by the [backup-restore-sidecar](https://github.com/metal-stack/backup-restore-sidecar), which pushes the backups to S3-compatible object storage. When a database starts up with an empty state, the sidecar automatically restores the most recent backup. Restoring a specific backup point manually is also supported, see the [manual restore documentation](../08-References/Control%20Plane/backup-restore-sidecar/manual_restore.md).

The following table summarizes the recovery approach for common disaster scenarios:

| Scenario                    | Recovery Approach                                                                                  |
|:----------------------------|:----------------------------------------------------------------------------------------------------|
| Control plane database loss | Restore the databases from the backups on the object storage, redeploy the control plane via CI/CD   |
| Partition loss              | Rebuild the partition using the partition Ansible playbooks                              |
| Switch failure              | Mount a replacement switch and re-run the partition Ansible playbooks (the topology is redundant, so a single switch failure does not cause an outage) |

During recovery, the metal-stack version referenced in the deployment Git repository is deployed — not the latest release. This ensures that the environment returns to its pre-outage state. Operators trigger this redeployment manually through the CI pipeline.

Backup of local machine storage is not covered by metal-stack. Machine/Disk failure will lead to data loss. To mitigate this a clustered storage system can be used to replicate data across multiple machines in multiple failure domains (e.g. machines, racks, partitions). In addition, we recommend automated and monitored backups and regular restore drills.