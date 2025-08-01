---
title: metal-stack v0.6.0
shortDescription: Clusters with private networks only
watermark: "Blog"
date: 2021-03-05T08:00:00+02:00
description: "Release v0.6.0 has landed! 🛸"
authors: [mwindower]
type: "blog"
tags:
  - release
  - network
  - kubernetes
  - gardener
---

Release v0.6.0 has landed! 🛸

<!-- truncate -->

## Clusters with private networks only

By default every metal-stack cluster gets a firewall in front of its workers that is driven by Kubernetes API-resources, all workers have internet connectivity and internet services can be published with `type: LoadBalancer`.

We see some customers which have use cases that need additional layers of security like a second, physically separated firewall in front of their application workload clusters. This is why we implemented support for Kubernetes clusters with private network only in metal-stack v0.6.0.

Private clusters have only private networks attached: e.g. a private network where Kubernetes node IPs are taken from and a private DMZ network where services of `type: LoadBalancer` get IPs from. The forefront cluster (DMZ cluster) is needed to intersect the DMZ network and the internet. This cluster may be used to deploy an internet ingress service, WAF or transparent proxy. Application clusters behind the DMZ cluster may serve as upstream or consume those services.

If you want to use this feature, you'll have to consider the following:

### 1. Basic requirements

- metal-stack >= v0.6.0 is needed
- firewall image >= 2021-03-04 is needed because big parts of the changes for this MEP were done in the [metal-networker](https://github.com/metal-stack/metal-networker/)

### 2. Create a DMZ network

We introduced a helper flag for `metalctl` to have an easy way to setup a DMZ network:

```
metalctl network allocate --name my-dmz-net --dmz --project <PROJECT> --partition <PARTITION> --labels network.metal-stack.io/default-external=""
```

### 3. Create clusters

- Create a DMZ cluster that has the DMZ network and internet configured as external network
- Create an application cluster that uses the DMZ network only as external network

### 4. Activate the Konnectivity-Tunnel feature

To reverse the VPN-Tunnel btw. Gardener Shoot and Seed Cluster you need to activate the Konnectivity-Tunnel feature gate for every application cluster that sits behind a DMZ cluster. This can be done with the following annotation for the Shoot resource:

```
alpha.featuregates.shoot.gardener.cloud/konnectivity-tunnel: "true"
```

This is needed to make `kubectl exec` and `kubectl logs` work because they connect from the `kube-apiserver` to the `kubelet` and we can't produce a publicly reachable VPN endpoint in the application clusters (they can't directly publish internet services).

Also it is necessary to deploy a `ClusterwideNetworkPolicy` to allow such communication paths at the DMZ and application clusters.

```yaml
apiVersion: metal-stack.io/v1
kind: ClusterwideNetworkPolicy
metadata:
  name: allow-to-konnectivity
  namespace: firewall
spec:
  egress:
    - ports:
        - port: 8132
          protocol: TCP
      to:
        - cidr: 0.0.0.0/0 # better: the ip of the kube-apiserver
```

## Is this an airgapped setup?

No, it isn't. Without further configuration, traffic to port 443 and 53 is still allowed on both firewalls. There is no easy way to keep all artifacts needed to bootstrap and update a Gardener / Kubernetes cluster locally.
