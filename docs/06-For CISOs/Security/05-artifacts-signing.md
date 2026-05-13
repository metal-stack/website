---
slug: /artifact-signing
title: Artifact Signing
sidebar_position: 5
---

# Artifact Signing

To increase trust and integrity, metal-stack introduces artifact signing for its released components.

The release vector is published as an [OCI artifact](/community/06-oci-artifacts.md) and signed using [cosign](https://github.com/sigstore/cosign).

The images are signed using a public key that is always attached to a metal-stack release in the [releases repository](https://github.com/metal-stack/releases/blob/master/cosign.pub).

To verify an image, the following command can be used:

```bash
cosign verify --key files/cosign.pub ghcr.io/metal-stack/metal-deployment-base:v0.9.2

Verification for ghcr.io/metal-stack/metal-deployment-base:v0.9.2 --
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - Existence of the claims in the transparency log was verified offline
  - The signatures were verified against the specified public key

[{"critical":{"identity":{"docker-reference":"ghcr.io/metal-stack/metal-deployment-base:v0.9.2"},"image":{"docker-manifest-digest":"sha256:8b4a19650efc27f6cd29798c94eca9f1ebbab2d20004a267d6729ad69f3c095f"},"type":"https://sigstore.dev/cosign/sign/v1"},"optional":{}},{"critical":{"identity":{"docker-reference":"ghcr.io/metal-stack/metal-deployment-base:v0.9.2"},"image":{"docker-manifest-digest":"sha256:8b4a19650efc27f6cd29798c94eca9f1ebbab2d20004a267d6729ad69f3c095f"},"type":"https://sigstore.dev/cosign/sign/v1"},"optional":{}}]
```

Certain images we also sign keyless in addition, such the command can also look like this:

```bash
cosign verify ghcr.io/metal-stack/metal-deployment-base:v0.9.2 --certificate-oidc-issuer https://accounts.google.com --certificate-identity keyless@metal-stack.iam.gserviceaccount.com

Verification for ghcr.io/metal-stack/metal-deployment-base:v0.9.2 --
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - Existence of the claims in the transparency log was verified offline
  - The code-signing certificate was verified using trusted certificate authority certificates

[{"critical":{"identity":{"docker-reference":"ghcr.io/metal-stack/metal-deployment-base:v0.9.2"},"image":{"docker-manifest-digest":"sha256:8b4a19650efc27f6cd29798c94eca9f1ebbab2d20004a267d6729ad69f3c095f"},"type":"https://sigstore.dev/cosign/sign/v1"},"optional":{}},{"critical":{"identity":{"docker-reference":"ghcr.io/metal-stack/metal-deployment-base:v0.9.2"},"image":{"docker-manifest-digest":"sha256:8b4a19650efc27f6cd29798c94eca9f1ebbab2d20004a267d6729ad69f3c095f"},"type":"https://sigstore.dev/cosign/sign/v1"},"optional":{}}]
```
