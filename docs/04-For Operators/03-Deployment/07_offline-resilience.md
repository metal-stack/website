---
slug: /deployment/offline-resilience
title: Offline Resilience
sidebar_position: 7
---

# Offline Resilience

It is possible to use metal-stack without any external network dependencies by integrating your own DNS and NTP configuration into the stack. This feature is great for workloads requiring strong independence and reliability. Even in case of an internet connection failure, your infrastructure remains operational. Existing machines do not encounter any downtime as well as new machines can be provisioned. All you need to have in place is a DNS and NTP server configured and accessible for metal-stack.

NTP servers need to be configured on the pixiecore and the metal-hammer microservices. This can be achieved by providing a list of NTP servers with the following Ansible variable through metal-roles:

```yaml
pixiecore_metal_hammer_ntp_servers: []
```

In the background, the pixiecore is taking the NTP servers and passing it via the `MetalConfig` to the metal-hammer. When booting bare-metal servers, the metal-hammer needs to configure NTP servers. It recognises the ones from the `MetalConfig` and configures itself accordingly.
If no NTP servers are passed along, the following standard servers are used:

- 0.de.pool.ntp.org
- 1.de.pool.ntp.org
- 2.de.pool.ntp.org

Moreover, machine and firewall images need to be configured with your custom DNS and NTP servers. The customisation can be made via the fields `ntp_servers` an `dns_servers` and specifying a list of servers in the creation request for the machine or firewall.

Within a partition default values for DNS and NTP servers can be configured. They are applied to all machines and firewalls within this partition, but can be replaced by specifying different ones inside the machine allocation request.

Thus, for creating a partition as well as a machine or a firewall, the flags `dnsservers` and `ntpservers` can be provided within the `metalctl` command.

In order to be fully offline resilient, make sure to check out `metal-image-cache-sync`. This component provides copies of `metal-images`, `metal-kernel` and `metal-hammer`.

This feature is related to [MEP14](/community/MEP-14-independence-from-external-sources).
