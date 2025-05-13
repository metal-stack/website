---
title: metal-stack v0.21.0 🙄
shortDescription:
watermark: "Blog"
date: 2025-03-21T10:00:00+01:00
authors: [gerrit]
description: "Sorry, but there are no new features in this release! Just a breaking change that operators need to be aware of."
type: "blog"
categories:
  - "Release"
# tags:
#   - "Release"
#   - "Kubernetes"
#   - "Network"
---

In this release we do not have any new features to present but a rather unfortunate breaking change in one of our dependencies we use for semantic versioning. If you are an operator of metal-stack, please read this article.

<!-- truncate -->

- [Breaking Change in Semantic Versioning for OS Images](#breaking-change-in-semantic-versioning-for-os-images)
  - [Naming of OS Image Releases](#naming-of-os-image-releases)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.21.0).

## Breaking Change in Semantic Versioning for OS Images

A [change in the semver library](https://github.com/Masterminds/semver/issues/258) that is used by metal-stack and in the Gardener project forces us to rename the identifiers that we typically use for OS images like Ubuntu 24.04. The library now requires stricter semantic versions, not allow leading zeroes in version segments.

In case you use for example `ubuntu-24.04.20250228` as an ID for an `image` in the metal-api, this needs to become `ubuntu-24.4.20250228`.

In order to introduce the new identifier-format, before updating to this release of metal-stack, an image has to be created according to the new version format. This image then co-exists with the old image format. After this, all machines referencing the old image must be reprovisioned with the new image ID format.

After all the references were migrated to the new image format, the old versions must be removed from the metal-api before upgrading to this release. Please adapt your deployments accordingly.

Unfortunately, there is no better way to migrate this ID. Another option was to fork the Gardener project, which we did not want to do. If you encounter bigger issues during this step, please contact us in our Slack channel.

### Naming of OS Image Releases

The Ubuntu OS images we release through [metal-images](https://github.com/metal-stack/metal-images) will continue to use the existing naming scheme. The download paths for our OS images will still contain leading zeros for Ubuntu LTS versions.

## More Information

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.21.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
