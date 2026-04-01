---
slug: /MEP-20-network-peering
title: MEP-20
sidebar_position: 20
---

# Network Peering

## **Summary**

This MEP proposes a **Network Peering** feature for `metal-stack` to enable direct routing between private networks of a project, shared networks, and external networks without traversing a firewall. This enhances flexibility for east-west traffic, zone-aware routing, and firewall-less deployments while maintaining security constraints.

## **Motivation**

Private networks in `metal-stack` are isolated in **VRFs (Virtual Routing and Forwarding)**, ensuring multi-tenancy and security. Access to other networks is controlled by firewalls, which may introduce unnecessary overhead in certain scenarios:

1. **Direct Storage Access**
    - There is already the feature of **shared networks** that can be used in cases where traffic should only pass one firewall btw source and desination.
    - With this new feature firewall traversal could be eliminated completly.
2. **Cluster-to-Cluster Communication**
    - Enable direct routing between private networks (e.g., Kubernetes clusters) without firewall intervention.
3. **Zone-Aware Routing**
    - Keep traffic local within a datacenter (e.g., storage access) instead of routing across zones (e.g. over a remote firewall and back to local storage).
4. **Firewall-Less Deployments**
    - Directly expose internet-facing services (e.g., IPv6 nodes) without a firewall.
5. **Enterprise/ISP Peering**
    - (Optional) Allow peering with external networks (e.g., corporate networks, ISPs).

### **Current Limitations**

- All inter-network traffic must pass through a firewall.
- No native support for direct VRF-to-VRF routing.
- No zone-aware routing for storage or cluster traffic.

## **Proposal**

Introduce a **Network Peering** mechanism that allows controlled routing between:

- Private networks within the **same project**.
- Private networks and **shared private networks**.
- Private networks and **external networks** (e.g., internet, enterprise networks).

### **Constraints**

- **No cross-project peering** (security boundary).
- **No transitive peering** (peering must be explicitly configured).

## **Design**

### **1. New Entity: `Peering`**

A new `peering` resource will be introduced in `metal-api` and `metalctl`:

```yaml
apiVersion: metal-stack.io/v1
kind: Peering
metadata:
  name: privnet1-to-storage
spec:
  network1: privnet1-id
  network2: storage-id
  peeringType: local  # local for peering VRFs at leaf switches, external for peering a with an external peer
  # Optional: BGP peering for external peering
  bgp:
    local:
        as: 65000
        cidr: 172.16.0.1/30
        port: "Ethernet0@exit01" 
    remote:
        as: 65001
        cidr: 172.16.0.2/30
```

### **2. CLI Commands**

```bash
# Create a peering between two private networks
metalctl network peering create --network1 privnet1 --network2 privnet2

# Create a peering between a private and shared network
metalctl network peering create --network1 privnet1 --network2 storage

# Create a peering between a private network and the internet
metalctl network peering create --network1 privnet1 --network2 internet

# (Optional) BGP peering with an external network
metalctl network peering create \
  --network1 internet \
  --localAs 65000 \
  --localCidr 172.16.0.1 \
  --localPort Ethernet0@exit01 \
  --remoteAs 65001 \
  --remoteCidr 172.16.0.2
```

### **3. Implementation in `metal-core`**

- **VRF Route Exchange**: Configure route exchange between VRFs on the leaf switches.
- **Security Policies**: Ensure no cross-project leaks.
- **Zone Awareness**: Prefer local routes over inter-zone routes.

### **4. Auto-Peering (Optional)**

- If a project has the label `auto-peer: "true"`, all its private networks can peer with each other.
- Requires additional validation to prevent misconfigurations.

## **Impact**

### **Positive**

- **Performance**: Reduces latency for east-west traffic.
- **Flexibility**: Enables new deployment models (e.g., firewall-less clusters).
- **Zone Awareness**: Keeps storage traffic local.

### **Negative**

- **Complexity**: Adds new configuration options.
- **Security Risks**: Misconfigurations could expose networks.
- **Operational Overhead**: Requires monitoring for route leaks.

## **Implementation Plan**

1. **Phase 1**: Add `Peering` entity to `metal-api` and `metalctl`.
2. **Phase 2**: Implement VRF route exchange in `metal-core`.
3. **Phase 3**: Add auto-peering (optional).
4. **Phase 4**: Support external BGP peering (if approved).

## **References**

- [Shared Networks MEP](https://github.com/metal-stack/metal-stack/blob/main/docs/meps/MEP-XXXX-shared-networks.md)
- [VRF Isolation in metal-stack](https://docs.metal-stack.io/stable/architecture/networking/)
- [BGP Peering Best Practices](https://tools.ietf.org/html/rfc7938)

## **Conclusion**

This MEP enables **secure, flexible network peering** in `metal-stack`, addressing key use cases while maintaining security boundaries.
