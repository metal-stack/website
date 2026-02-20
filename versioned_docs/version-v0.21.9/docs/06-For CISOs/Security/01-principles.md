---
slug: /security-principles
title: Security Principles
sidebar_position: 1
---

# Security Principles

metal-stack adheres to several security principles to ensure the integrity, confidentiality and availability of its services and data. These principles guide the design and implementation of security measures across the metal-stack architecture.

## Minimal Need to Know

The minimal need to know principle is a security concept that restricts access to information and resources only to those who absolutely need it for their specific role or task. This principle is implemented throughout the metal-stack architecture and operational practices to enhance security and reduce the risk of unauthorized access or data breaches.

### RBAC

:::info
As of now metal-stack does not implement fine-grained Role-Based Access Control (RBAC) within the `metal-api` but this is worked on in [MEP-4](..//community/MEP-4-multi-tenancy-for-the-metal-api).
:::

As described in our [User Management](../../05-Concepts/02-user-management.md) concept the [metal-api](https://github.com/metal-stack/metal-api) currently offers three different user roles for authorization:

- `Admin`
- `Edit`
- `View`

To ensure that internal components interact securely with the metal-api, metal-stack assigns specific roles to each service based on the principle of least privilege.

| Component                                                                                                             | Role  |
| --------------------------------------------------------------------------------------------------------------------- | ----- |
| [metal-image-cache-sync](https://github.com/metal-stack/metal-image-cache-sync)                                       | View  |
| [machine-controller-manager-provider-metal](https://github.com/metal-stack/machine-controller-manager-provider-metal) | Edit  |
| [gardener-extension-provider-metal](https://github.com/metal-stack/gardener-extension-provider-metal)                 | Edit  |
| [metal-bmc](https://github.com/metal-stack/metal-bmc)                                                                 | Edit  |
| [metal-core](https://github.com/metal-stack/metal-core)                                                               | Edit  |
| [metal-hammer](https://github.com/metal-stack/metal-hammer/)                                                          | View  |
| [metal-metrics-exporter](https://github.com/metal-stack/metal-metrics-exporter)                                       | View  |
| [metal-ccm](https://github.com/metal-stack/metal-ccm)                                                                 | Admin |
| [pixiecore](https://github.com/metal-stack/pixie)                                                                     | View  |
| [metal-console](https://github.com/metal-stack/metal-console)                                                         | Admin |
| [cluster-api-provider-metal-stack](https://github.com/metal-stack/cluster-api-provider-metal-stack)                   | Edit  |
| [firewall-controller-manager](https://github.com/metal-stack/firewall-controller-manager)                             | Edit  |

Users can interact with the metal-api using [metalctl](https://github.com/metal-stack/metalctl), the command-line interface provided by metal-stack. Depending on the required operations, users should authenticate with the appropriate role to match their level of access.

## Defense in Depth

Defense in depth is a security strategy that employs multiple layers of defense to protect systems and data. By implementing various security measures at different levels, metal-stack aims to mitigate risks and enhance overall security posture.

## Redundancy

Redundancy is a key principle in metal-stack's security architecture. It involves duplicating critical components and services to ensure that if one fails, others can take over, maintaining system availability and reliability. This is particularly important for data storage and processing, where redundancy helps prevent data loss and ensures continuous operation.

## BMC User Management

For bare metal provisioning with metal-stack, two dedicated users to interact with a machine BMC are created.
The `metal-hammer` first creates a BMC user called `root` or `superuser` with the administrator privilege. The password used, is configured with the Ansible variable [`metal_api_bmc_superuser_pwd`](https://github.com/metal-stack/metal-roles/blob/master/control-plane/roles/metal/README.md#metal-api). It is necessary e.g. for [`metal-bmc`](https://github.com/metal-stack/metal-roles/blob/master/partition/roles/metal-bmc/README.md), to perform its actions while deleting a machine and adding it to the pool of available machines again.

:::info
Note: The superuser feature is optional. If no superuser password is configured, it is disabled. In this case, `metal-bmc` cannot report machine data for unallocated machines.
:::

Afterwards a user called `metal` with administrator privileges is created by `metal-hammer`. This happens while the machine registers itself at the `metal-api`. Its password is not configured via an Ansible variable in `metal-roles`, because it is generated automatically and added to the `MachineIPMI` details. The `Register` event is issued to the `metal-api` to store all necessary machine details. Each time a machine is allocated, its password is reset, while the user account itself remains in place. The applied password constraints are as follows:

- Password length: 10 characters
- Number of digits: 3
- Number of special characters: 0
- Uppercase allowed
- Repeated characters allowed

The `metal` user is solely intended for SOL (Serial over LAN) out-of-band administrative access to the machine via [metalctl](/docs/references/metalctl). To establish this connection, the [`metal-console`](docs/references/metal-console) component is used, which transfers console output over SSH. This setup ensures secure, remote out-of-band management, allowing operators to troubleshoot and control machines even when the operating system is unavailable.
To maintain security, the BMC credentials should be treated as system-managed accounts. For security and compliance, administrators are strongly advised to avoid interactive logins with them.