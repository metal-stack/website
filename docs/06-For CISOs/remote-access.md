---
slug: /remote-access
title: Remote Access
---
# Remote Access

## Machines and Firewalls

Remote access to machines and firewalls is essential for performing administrative tasks such as incident management, troubleshooting and sometimes for development. Standard SSH access is often insufficient for these purposes. In many cases, direct serial console access is required to fully manage the system. metal-stack follows a security-first approach by not offering direct SSH access to machines. This practice reduces the attack surface and prevents unauthorized access that could lead to system damage. Detailed information can be found in [MEP-9](/community/MEP-9-no-open-ports-to-the-data-center). Administrators can access machines in two primary ways.

**Out-of-band management via SOL**

```bash
metalctl machine console <ID> --ipmi
```

This method leverages the machine’s BMC. For detailed user configuration, see the [BMC User Management](Security/01-principles.md#bmc-user-management) section.

**Via metal-console:**

```bash
metalctl machine console <ID>
```

This approach uses the [`metal-console`](../08-References/Control%20Plane/metal-console/metal-console.md), which is required to establish console access. This component acts as a bridge between SSH and the console protocol of the concrete machine.

Both methods ensure secure and controlled access to machines without exposing them unnecessarily to the network, maintaining the integrity and safety of the infrastructure.

Connecting directly to a machine without a clear plan of action can have unintended consequences and negatively impact stability. For this reason, administrative privileges are required. This restriction ensures that only authorized personnel with the necessary expertise can perform actions that affect the underlying infrastructure. These principles will evolve with the introduction of [MEP-4](/community/MEP-14-independence-from-external-sources).
