---
slug: /sbom
title: SBOM
sidebar_position: 2
---

# SBOM

Every container image and binary that's part of metal-stack contains an _SBOM_ (Software Bill of Materials). It provides
a detailed inventory of components within container images and binaries, enabling you to manage vulnerabilities and
compliance effectively.

We decided to use [_SPDX_ (Software Package Data Exchange)](https://spdx.dev/), as it is among the most widely adopted
standards and is natively supported in Docker. Docker utilizes the
[in-toto SPDX format](https://github.com/in-toto/attestation/blob/main/spec/predicates/spdx.md), while binary-*SBOM*s
are created using [Syft](https://github.com/anchore/syft).

*SBOM*s are created as part of each repository's _GitHub Actions_ workflow utilizing
[Anchore SBOM Action](https://github.com/marketplace/actions/anchore-sbom-action) for binaries and
[Build and push Docker images](https://github.com/marketplace/actions/build-and-push-docker-images) for container
images.

## Download _SBOM_ of a container image

```bash
docker buildx imagetools inspect ghcr.io/metal-stack/<image name>:<tag> --format "{{ json .SBOM.SPDX }}" > sbom.json
```

For further info, refer to the
[Docker docs](https://docs.docker.com/build/metadata/attestations/sbom/#inspecting-sboms).

## Download _SBOM_ of a binary from the GitHub release

```bash
wget https://github.com/metal-stack/<repository name>/releases/latest/download/sbom.json
```

Please note, if more than one binary is released, e.g. for different platforms / architectures, you are required to
include this info in the _SBOM_ file name as well.

```bash
# This is an example using https://github.com/metal-stack/metalctl
wget https://github.com/metal-stack/metalctl/releases/latest/download/sbom-darwin-arm64.json
```

## Identify CVEs

There are many tools that can help you to identify the CVEs with the help of an SBOM. Just to name one example,
[grype](https://github.com/anchore/grype) can be used to do this, which would look like this:

```plain
$ grype sbom-darwin-arm64.json
 ✔ Scanned for vulnerabilities     [14 vulnerability matches]
   ├── by severity: 0 critical, 5 high, 9 medium, 0 low, 0 negligible
NAME                                 INSTALLED  FIXED IN         TYPE       VULNERABILITY        SEVERITY  EPSS           RISK
stdlib                               go1.24.5   1.24.8, 1.25.2   go-module  CVE-2025-61723       High      < 0.1% (23rd)  < 0.1
stdlib                               go1.24.5   1.24.8, 1.25.2   go-module  CVE-2025-61725       High      < 0.1% (23rd)  < 0.1
stdlib                               go1.24.5   1.24.8, 1.25.2   go-module  CVE-2025-58186       Medium    < 0.1% (17th)  < 0.1
stdlib                               go1.24.5   1.24.8, 1.25.2   go-module  CVE-2025-61724       Medium    < 0.1% (17th)  < 0.1
stdlib                               go1.24.5   1.24.8, 1.25.2   go-module  CVE-2025-47912       Medium    < 0.1% (16th)  < 0.1
stdlib                               go1.24.5   1.24.8, 1.25.2   go-module  CVE-2025-58188       High      < 0.1% (8th)   < 0.1
stdlib                               go1.24.5   1.24.8, 1.25.2   go-module  CVE-2025-58189       Medium    < 0.1% (12th)  < 0.1
github.com/gorilla/csrf              v1.7.3                      go-module  GHSA-82ff-hg59-8x73  Medium    < 0.1% (8th)   < 0.1
stdlib                               go1.24.5   1.23.12, 1.24.6  go-module  CVE-2025-47907       High      < 0.1% (4th)   < 0.1
stdlib                               go1.24.5   1.23.12, 1.24.6  go-module  CVE-2025-47906       Medium    < 0.1% (5th)   < 0.1
stdlib                               go1.24.5   1.24.8, 1.25.2   go-module  CVE-2025-58185       Medium    < 0.1% (6th)   < 0.1
stdlib                               go1.24.5   1.24.9, 1.25.3   go-module  CVE-2025-58187       High      < 0.1% (2nd)   < 0.1
stdlib                               go1.24.5   1.24.8, 1.25.2   go-module  CVE-2025-58183       Medium    < 0.1% (2nd)   < 0.1
github.com/go-viper/mapstructure/v2  v2.3.0     2.4.0            go-module  GHSA-2464-8j7c-4cjm  Medium    N/A            N/A
```

Or even simpler by passing the output of `docker buildx imagetools inspect` into grype like so:

```bash
docker buildx imagetools inspect ghcr.io/metal-stack/<image name>:<tag> --format "{{ json .SBOM.SPDX }}" | grype
```
