---
title: Support for Dell Servers
shortDescription:
watermark: "Blog"
date: 2026-03-10T10:00:00+02:00
description: "With release v0.22.6, metal-stack now supports Dell server hardware, providing greater flexibility and vendor independence for every metal-stack environment."
authors: [simcod]
type: "blog"
tags:
  - news
  - release
---

With release v0.22.6, we are pleased to announce that [metal-stack.io](http://metal-stack.io/) has been officially tested and validated to run on Dell server hardware.

This milestone continues a journey we started last year when we [introduced](../../2025/12-ocp-hardware/index.md) support for an additional hardware vendor. With Dell adding to the list of supported hardware, metal-stack takes another step toward broader hardware compatibility — giving users greater flexibility when setting up bare-metal private cloud environments and reducing dependency on any single vendor.

The testing process validated the operation of metal-stack.io on Dell servers, confirming its readiness for enterprise-grade deployments.

## Vendor-Agnostic Serial Console Access

Alongside Dell support, our pixiecore component was improved: it can now detect the server manufacturer during the boot process. As a result, the serial console is now available for maintenance tasks across all machines in your partition, regardless of vendor — something that was not possible before this release.

## More Information

You want to know more about everything that landed in this release? Check out the full [release notes](https://github.com/metal-stack/releases/releases/tag/v0.22.6).
