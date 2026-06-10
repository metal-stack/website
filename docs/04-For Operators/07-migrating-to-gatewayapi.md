---
slug: /migrating-to-gatewayapi
title: Migrating to Gateway API
sidebar_position: 7
---

# Migrating to Gateway API

:::warning
Gateway API support in metal-stack is still in development. Changes are expected, especially around certificate management.
:::

From version `x.y.z` <!-- TODO: fill in the first metal-stack release that ships Gateway API support --> metal-stack supports [Gateway API](https://gateway-api.sigs.k8s.io/) as a replacement for Kubernetes `Ingress` resources.

This guide explains why we are moving to Gateway API, what changes for you as an operator, and how to migrate an existing metal-stack installation.

## Motivation

`ingress-nginx` has been deprecated and we currently depend on it. metal-stack
has control-plane components that are not served via HTTP/GRPC. Those are
exposed as TCP Services via `ingress-nginx`. As a result we are going to move
all metal-stack components to Gateway API.

## What will change

### Certificate provisioning and TLS termination

Certificate provisioning and TLS termination will move into the Gateway resource. metal-stack deployed via metal-roles will expect TLS termination to happen on the Gateway.

Exceptions for TLS termination:

- NSQ will for now still terminate its own certificates
- The GRPC endpoint of metal-api will stay a TCPRoute and TLS termination will stay in the application. As metal-api will be superseded by metal-apiserver in the near future, we do not see the value in migrating it fully

### Continued need for an Ingress Controller

For some vendor dependencies you will still require an ingress controller. Examples of services still relying on Ingress are Gardener and Thanos. As ingress-nginx is EoL we recommend switching to a different Ingress Controller implementation.

## Before you begin

### Familiarize yourself with Gateway API

Gateway API is more complex than Ingress and consists of multiple different resources and operator personas. The rest of the guide assumes a basic understanding of the `HTTPRoute`, `TCPRoute`, `Gateway`, `GatewayClass`. An introduction can be found [here](https://gateway-api.sigs.k8s.io/docs/introduction/)

### Gateway API implementation requirements

metal-stack does not require one specific Gateway API implementation.
You can choose any Gateway API implementation that provides the following features:

- `HTTPRoute`
- `TCPRoute`

In our [mini-lab](https://github.com/metal-stack/mini-lab/pull/299) demo environment we are running [Envoy Gateway](https://gateway.envoyproxy.io/docs/).

### Migration Path decisions

- Select a Gateway API implementation, e.g. [Envoy Gateway](https://gateway.envoyproxy.io/docs/)
- Certificate management: Gateway API now requires the Gateway to know

## Migration preparation

### Gateway deployment

As we require `TCPRoute`s you will have to make changes to your existing Gateways, if applicable.
Still, we suggest you create a dedicated metal-stack gateway, like we do for [mini-lab](https://github.com/metal-stack/mini-lab/tree/feat/gatewayapi/roles/gateway). <!-- TODO: replace with the final (merged) mini-lab link once available -->

We recommend provisioning a metal-stack exclusive Gateway resource, metal-stack requires multiple TCP endpoints.

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
<!-- TODO: scaffold — show/describe the Gateway resource: which listeners (HTTP, HTTPS, TCP), ports, hostnames, and the gatewayClassName operators should configure -->

### Certificate management

The biggest change during the Gateway API migration is certificate management. Using Ingress Controllers the Ingress resource configured if, and using what certificates TLS connections were terminated. This changed in Gateway API, where the Gateway listener you attach the Route on decides if TLS is used and which certificate will be used for termination.

metal-stack.io does not require any specific certificate management process. It is possible to use self-signed/private CA certificates as well as certificates public CAs.

:::tip
Use automated certificate management.
[cert-manager](https://cert-manager.io/docs/usage/gateway/) can handle your
certificate renewal and supports Gateway API. You can use Let's Encrypt for valid
public certificates or use a private CA.

You can issue valid public TLS certs using [Let's Encrypt](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability) against IP addresses if no DNS record is available.
:::

### TLS termination locations

Exposed components with TLS terminated at the Gateway:

- metal-api (excl. GRPC endpoint)
- metal-apiserver
- metal-console
- zitadel
- headscale

Exposed components terminating TLS in the application Pod:

- metal-api GRPC endpoint
- nsq

<!-- TODO: scaffold — describe how certificates are wired to the Gateway listeners (Certificate / Issuer resources, secret references), and the recommended setup for private vs. public CAs -->

### Migrating Components

::: warning
The old Ingress Controller and new Gateway are going to have different IP addresses.
:::

Deploy the httproutes and tcproutes for each component using metal-role. *routes and Ingress resources can be deployed at the same time. To switch over a service to the Gateway, change the DNS record of that service from pointing to the Ingress Controller to the Gateway.

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


## Remaining ingress controller dependencies

For some vendor dependencies you will still require an ingress controller:

- Gardener
- Thanos

<!-- TODO: scaffold — explain how the ingress controller and the Gateway coexist, and what each remaining dependency needs -->

## Verification

<!-- TODO: scaffold — how to confirm the migration succeeded:
- Routes are accepted/programmed (status conditions)
- TLS termination works
- TCP services reachable
- end-to-end smoke test
-->

## Rollback

<!-- TODO: scaffold — guidance on reverting to ingress-nginx if the migration needs to be backed out -->

## References

- [Gateway API](https://gateway-api.sigs.k8s.io/)
- [Envoy Gateway](https://gateway.envoyproxy.io/docs/)
- [cert-manager — Gateway API usage](https://cert-manager.io/docs/usage/gateway/)
- [mini-lab gateway role](https://github.com/metal-stack/mini-lab/tree/feat/gatewayapi/roles/gateway) <!-- TODO: replace with final link -->
