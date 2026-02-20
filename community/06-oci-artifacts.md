---
slug: /oci-artifacts
title: OCI Artifacts
sidebar_position: 6
---

# OCI Artifacts

Certain artifacts of metal-stack are not shipped as Docker containers but in a more generic registry container format following the [OCI](https://opencontainers.org/) specification. Examples for these artifacts are the metal-stack release vectors as defined by the [releases](https://github.com/metal-stack/releases) repository or ansible-roles that can be used for deploying metal-stack.

The OCI artifacts have an expected format convention, which is described on this page.

## Release Vector Artifacts

This OCI artifact expects a layer with the artifact type `application/vnd.metal-stack.release-vector.v1` including one gzipped tar file called `release.tar.gz`, which should be marked with custom media type `application/vnd.metal-stack.release-vector.v1.tar+gzip`.

Inside the tar file, there is a `release.yaml` file that contains a metal-stack release vector.

The metal-stack release vector has a free format but by default expects an `ansible-roles` key at the root, mapping the role names to OCI artifacts and versions, like:

```
ansible-roles:
  <example>:
    oci: <image-name>
    version: <image-ref>
  # e.g.:
  ansible-common:
    oci: ghcr.io/metal-stack/ansible-common
    repository: https://github.com/metal-stack/ansible-common
    version: v0.7.2
```

If this convention is not followed, it is not possible to install ansible-roles through the `metal_stack_release_vector` image as provided by the metal-deployment-base deployment base image.

## Ansible Roles

This OCI artifact expects a layer with the artifact type `application/vnd.metal-stack.release-vector.v1` including one gzipped tar file called `ansible-role.tar.gz`, which should be marked with custom media type `application/vnd.metal-stack.ansible-role.v1.tar+gzip`.

Inside the tar file, there is **one folder** containing the ansible-role to install. Please do not include multiple folders as otherwise the `metal_stack_release_vector` module cannot alias role names, which is sometimes required for deployments.
