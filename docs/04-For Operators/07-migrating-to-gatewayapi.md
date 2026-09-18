---
slug: /migrating-to-gatewayapi
title: Migrating to Gateway API
sidebar_position: 7
---

# Migrating to Gateway API

:::warning
Gateway API support in metal-stack is still in development. Changes are expected, especially around certificate management.
:::

From version [v0.22.21](https://github.com/metal-stack/releases/releases/tag/v0.22.21) the metal-stack control plane supports [Gateway API](https://gateway-api.sigs.k8s.io/) as a replacement for Kubernetes `Ingress` resources. With [v0.22.23](https://github.com/metal-stack/releases/releases/tag/v0.22.23) the monitoring components can also be migrated to Gateway API such that there are no required dependencies on `Ingress` resources in metal-stack anymore.

This guide explains why we moved to Gateway API, what changes for you as an operator, and how to migrate an existing metal-stack installation.

## Motivation

`ingress-nginx` has been deprecated and the metal-stack control plane depended on it. metal-stack
has control-plane components that are not served via HTTP/GRPC. Those are
exposed as TCP Services via `ingress-nginx`. As a result we are going to move
all metal-stack components to Gateway API.

## What will change

### Certificate provisioning and TLS termination

Certificate provisioning and TLS termination will move into the Gateway resource. metal-stack deployed via metal-roles will expect TLS termination to happen on the Gateway.

Exceptions for TLS termination:

- NSQ will for now still terminate its own certificates
- The GRPC endpoint of metal-api will stay a `TCPRoute` and TLS termination will stay in the application. As metal-api will be superseded by metal-apiserver in the near future, we do not see the value in migrating it fully

## Before you begin

### Familiarize yourself with Gateway API

Gateway API is more complex than Ingress and consists of multiple different resources and operator personas. The rest of the guide assumes a basic understanding of the `HTTPRoute`, `TCPRoute`, `Gateway`, `GatewayClass`. An introduction can be found [here](https://gateway-api.sigs.k8s.io/docs/introduction/).

### Gateway API implementation requirements

metal-stack does not require one specific Gateway API implementation.
You can choose any Gateway API implementation that provides the following features:

- `HTTPRoute`
- `TCPRoute`

In our [mini-lab](https://github.com/metal-stack/mini-lab/pull/299) demo environment we are running [Envoy Gateway](https://gateway.envoyproxy.io/docs/).

### Migration Path decisions

Most importantly: If something goes wrong please note that the downtime of the metal-stack API is usually no big issue. All provisioned machines and the network will just continue to work. It is just that no entities can be added or removed during the outage (e.g. no new machine allocations can take place), which is usually tolerable for small time windows.

First you will need to:

- Select a Gateway API implementation, e.g. [Envoy Gateway](https://gateway.envoyproxy.io/docs/)
- Check your certificate management: Gateway API now requires the Gateway to know

Then decide the migration strategy:

1. Deploy ingress-nginx and the Gateway in parallel and then switch over the DNS entry (minimum amount of downtime, recommended for production environments)
2. Remove ingress-nginx and deploy Gateway (less time-consuming, for testing environments)

## Migration preparation

### Gateway deployment

As we require `TCPRoute`s you will have to make changes to your existing Gateways, if applicable.
Still, we suggest you create a dedicated metal-stack gateway, like we do for [mini-lab](https://github.com/metal-stack/mini-lab/tree/master/roles/gateway).

We recommend provisioning a metal-stack Gateway resource as metal-stack requires multiple TCP endpoints.

#### Example

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: metal-control-plane
  namespace: metal-control-plane
spec:
  gatewayClassName: eg
  listeners:
  - hostname: '*.<metal-stack FQDN>'
    name: http
    port: 80
    protocol: HTTP
  - hostname: '*.<metal-stack FQDN>'
    name: https
    port: 443
    protocol: HTTPS
    tls:
      certificateRefs:
      - group: ""
        kind: Secret
        name: metal-api-tls
      mode: Terminate
  - name: nsq
    port: 4150
    protocol: TCP
  - name: metal-api-grpc
    port: 50051
    protocol: TCP

```

### Certificate management

The biggest change during the Gateway API migration is certificate management. Using Ingress Controllers the Ingress resource configured if, and using what certificates TLS connections were terminated. This changed in Gateway API, where the Gateway listener you attach the Route on decides if TLS is used and which certificate will be used for termination.

metal-stack.io does not require any specific certificate management process. It is possible to use self-signed/private CA certificates as well as certificates public CAs.

:::tip
Use automated certificate management.
[cert-manager](https://cert-manager.io/docs/usage/gateway/) can handle your
certificate renewal and supports Gateway API. You can use Let's Encrypt for valid
public certificates or use a private CA.

You can issue valid public TLS certs using [Let's Encrypt](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability) against an IP address if no DNS record is available.
:::

### TLS termination locations

Exposed components with TLS terminated at the Gateway:

- metal-api (excl. GRPC endpoint)
- metal-apiserver
- metal-console
- zitadel
- headscale

For using public CAs with cert-manager, just annotate your Gateway resource with `cert-manager.io/cluster-issuer: <your-cluster-issuer>`. This will create the certificates as defined by your `ClusterIssuer`, which can of course also use Gateway API. For private CAs, you can generate them as usual and deploy them accordingly through your deployment automation.

Exposed components terminating TLS in the application Pod (currently always self-signed certificates):

- metal-api GRPC endpoint
- nsq

### Migrating Components

::: warning
The old Ingress Controller and new Gateway are going to have different IP addresses.
:::

If you decide for the hard cutover route (only recommended for test environments), just disable the ingress deployment parameters and enable `HTTPRoute`s and `TCPRoute`s for each component using metal-roles. However, the less intrusive way for the migration without downtime allows the deployment of *routes and Ingress resources at the same time*. For the `metal` role this can be achieved using the following parametrization:

```yaml
metal_deploy_ingress: true
metal_api_httproute_enabled: true

metal_deploy_ingress_api_v1_rules: true
metal_deploy_ingress_api_v2_rules: false
```

With this setup, you will be able to check the availability through Gateway while the existing `Ingress` continues serving workload traffic. You can check the service availability of the metal-api for instance with:

```bash
curl https://<your-metal-api-domain>/v1/health --resolve '<your-metal-api-domain>:443:<new-gw-ip>'
```

In case you use cert-manager and the `Certificate`s cannot be issued before you switch over the DNS entry with the configuration you use, it is possible to temporarily copy over the existing `Secret`s. If you need this strtegy, make sure that after completing the migration cert-manager can issue new certificates.

To switch over a service to the Gateway, change the DNS record of that service from pointing to the Ingress Controller to the Gateway.

Example for zitadel, nsq and metal_apiserver. For full documentation of all services please consult the [metal-roles repository](https://github.com/metal-stack/metal-roles).

```yaml

zitadel_httproute_enabled: true
zitadel_httproute_parent_refs:
- name: metal-control-plane
  sectionName: https

nsq_tcproute_enabled: true
nsq_tcproute_parent_refs:
- name: metal-control-plane
  sectionName: nsq

metal_apiserver_httproute_enabled: true
metal_apiserver_httproute_parent_refs:
- name: metal-control-plane
  sectionName: http
- name: metal-control-plane
  sectionName: https
```

## Verification

Check your endpoints are still reachable on their expected host names/IP addresses. The easiest way to do that is to check with metalctl(metal-api)/metalctlv2(metal-apiserver).

It is also recommended to check if the DNS records really resolve the new Gateway and are not accessed via the old ingress infrastructure. Use `nslookup`/`dig` to check your hostname and make sure they resolve to the same IP address as the Gateway.

## Rollback

You can roll back to ingress any time if an unresolvable blocker is discovered during the migration. Revert the deployment variables and rerun the playbook.

## References

- [Gateway API](https://gateway-api.sigs.k8s.io/)
- [Envoy Gateway](https://gateway.envoyproxy.io/docs/)
- [cert-manager — Gateway API usage](https://cert-manager.io/docs/usage/gateway/)
- [mini-lab gateway role](https://github.com/metal-stack/mini-lab/roles/gateway)
