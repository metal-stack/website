---
slug: /artifact-signing
title: Artifact Signing
---

# Artifact Signing

To increase trust and integrity, metal-stack introduces artifact signing for its released components.

The release vector is now published as an OCI artifact and signed using [cosign](https://github.com/sigstore/cosign). While this feature is currently available as a preview, our long-term goal is to extend signing to all metal-stack container images as well, ensuring that users can always verify the authenticity of the artifacts they consume.