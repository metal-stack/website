---
title: metal-stack v0.9.0 🗜️
shortDescription: Enhanced user experience for the mini-lab by leveraging Containerlab ♥
watermark: "Blog"
date: 2021-12-06T08:00:00+02:00
description: "metal-stack v0.9.0 was released. Read the summary of changes in this blog article."
authors: [gerrit91]
type: "blog"
categories:
  - "Release"
tags:
  - "Release"
  - "Kubernetes"
---

metal-stack v0.9.0 was released. Predominantly, this is a mini-lab release, greatly reducing the required dependencies to run metal-stack on your local developer machine. 🤓

<!-- truncate -->

- [mini-lab Next Generation](#mini-lab-next-generation)
- [Performance Improvements](#performance-improvements)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.9.0).

## mini-lab Next Generation

Just as a reminder, the mini-lab is a small virtual setup of the metal-stack that can be launched on a regular Linux computer or notebook. While maintaining all the major traits of big metal-stack installations, the lab can be used for trying out metal-stack, demonstration purposes or development without having to work on real hardware resources.

In this release, the mini-lab got a huge update: It is now leveraging benefits of a neat Open Source project called [Containerlab](https://containerlab.srlinux.dev/).

The Containerlab project basically replaces the entire Vagrant-based hardware rack simulation inside the mini-lab. Instead of launching switches and machines as Virtual Machines (VMs) directly on the host (isolating network interfaces through point-to-point connections), Containerlab wires up all the parts including the network topology using only Docker containers and networks.

This makes it much easier to setup prerequisites for running the mini-lab, such that dependencies on the host machine are now reduced to:

- KVM (which every Linux host should possess)
- Docker + docker-compose
- Kind
- Containerlab

Internally, the switches are wrapped inside [ignite](https://github.com/weaveworks/ignite) MicroVMs, the PXE clients that require an UEFI BIOS are managed directly through QEMU. So, there is a lot of cool low-level stuff going on under the hood, which a user is invited to explore on interest. 😎

Kudos to [@GrigoriyMikhalkin](https://github.com/GrigoriyMikhalkin) who contributed the PR with all the heavy lifting. There's still lots of things and ideas around for improving the mini-lab and reducing the dependency stack even further. Watch out for further updates in the future.

## Performance Improvements

As the production landscape is growing steadily, starting with this release we are trying to make performance improvements an integral part of our releases. In this release, we have made several improvements to prevent expensive backend calls to the metal-api using more precise filter queries and client requests. We were also trimming down very specific parts of response payloads and made them optional in order to reduce response times of the API.

We already identified many more places where these kind of changes will make a great deal and also have a lot of ideas to enable the metal-stack to scale for every size of a data center. So, more enhancements will follow. 🏃

## More Information

This is only a small extract of what went into our v0.9.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.9.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
