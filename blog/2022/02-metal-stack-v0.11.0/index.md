---
title: metal-stack v0.11.0 🍁
shortDescription:
watermark: "Blog"
date: 2022-09-14T08:00:00+02:00
description: "Here comes metal-stack v0.11.0. Read the quick summary of changes in this blog article!"
authors: [gerrit]
type: "blog"
categories:
  - "Release"
tags:
  - "Release"
  - "Kubernetes"
---

It's release time again! Let us share what the new metal-stack v0.11.0 has to offer. ☺

<!-- truncate -->

- [MEP-9 Groundwork: Firewall SSH Through Headscale VPN](#mep-9-groundwork-firewall-ssh-through-headscale-vpn)
- [New Provisioning FSM](#new-provisioning-fsm)
- [metalctl Refactoring](#metalctl-refactoring)
- [Birth of metal-bmc](#birth-of-metal-bmc)
- [backup-restore-sidecar Now Providing ETCD Backend](#backup-restore-sidecar-now-providing-etcd-backend)
- [Gardener Compatibility to v1.39](#gardener-compatibility-to-v139)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.11.0).

## MEP-9 Groundwork: Firewall SSH Through Headscale VPN

At the time being, firewalls that are provisioned through metal-stack are configured with an open SSH port, which can be used by operators to access the firewall for maintenance reasons. In order to reduce the attack surface to our machines in the data center, we are providing the option to close open SSH ports to all our firewalls soon!

In the latest metal-stack release, the metal-api can be deployed along with a [headscale](https://github.com/juanfont/headscale) server to make freshly provisioned firewalls join a tailscale VPN network automatically. Operators can then join this VPN network, too, using `metalctl` and access firewall machines through this VPN network.

We already merged the entire integration of headscale into this release, however, some open pull requests are still missing to make this feature complete. There is an open PR on [metalctl](https://github.com/metal-stack/metalctl/pull/148) and [mini-lab](https://github.com/metal-stack/mini-lab/pull/117) plus the required changes of the firewall os-image in [metal-images#141](https://github.com/metal-stack/metal-images/pull/141). These pull requests will be contained in the upcoming metal-stack patch releases, so watch out for the upcoming patch releases. 😍

Thanks to [@GrigoriyMikhalkin](https://github.com/GrigoriyMikhalkin), who contributed the major parts of this enhancement proposal.

## New Provisioning FSM

In the metal-api there used to be a small state machine, which is responsible for showing the current state of a machine. Such a state can for example be `Installing`, indicating that an operating system is currently installed onto an allocated machine or `Phoned Home`, which is shown when a machine was successfully provisioned for a user.

As the first implementation of the provisioning state machine was becoming a more and more unmaintainable beast, [@iljarotar](https://github.com/iljarotar) started to integrate a more sophisticated state machine based on the [looplab/fsm library](https://github.com/looplab/fsm). The new state machine is much better to test and also allows detecting some more error states, like a failed machine reclaim or crashloops.

These new states were properly integrated into `metalctl` and also come with a brief summary:

```
❯ m machine issues
display machines which are in a potential bad state

Meaning of the emojis:

🚧 Machine is reserved. Reserved machines are not considered for random allocation until the reservation flag is removed.
🔒 Machine is locked. Locked machines can not be deleted until the lock is removed.
💀 Machine is dead. The metal-api does not receive any events from this machine.
❗ Machine has a last event error. The machine has recently encountered an error during the provisioning lifecycle.
❓ Machine is in unknown condition. The metal-api does not receive phoned home events anymore or has never booted successfully.
⭕ Machine is in a provisioning crash loop. Flag can be reset through an API-triggered reboot or when the machine reaches the phoned home state.
🚑 Machine reclaim has failed. The machine was deleted but it is not going back into the available machine pool.
```

All these error states are documented on [docs.metal-stack.io](https://docs.metal-stack.io/stable/installation/troubleshoot/#Fixing-Machine-Issues), such that operators can always look them up when needed.

Thank you for the nice work, [@iljarotar](https://github.com/iljarotar)!

## metalctl Refactoring

The metal-stack CLI `metalctl` was almost completely rewritten utilizing Golang Generics. 😱

This brings a lot of improvements, for example:

- More consistent behavior across all basic commands (`list`, `describe`, `edit`, `create`, `apply`, `update` and `edit`) including bug fixes at several places
- Sorting improvements (including auto completion and sort order possibilities)
- Printer improvements with consistent behavior across the board (more compact tables!!)
- Possibility to efficiently unit test the commands and reduced maintenance overhead

We hope you find these improvements useful as well!

## Birth of metal-bmc

metal-bmc (formerly known as bmc-catcher) now replaces the bmc-proxy and bmc-reverse-proxy components on the management server. This is the continuation of our last release refactorings, which moves all bmc-related functionality into a single component.

This refactoring allowed us to free the metal-core from these tasks and make the switch plane more robust.

Kudos to [@majst01](https://github.com/majst01)!

## backup-restore-sidecar Now Providing ETCD Backend

Our [backup-restore-sidecar](https://github.com/metal-stack/backup-restore-sidecar) does now also support ETCD for backup and restore functionality. We internally have some plans with it and maybe you can benefit from this, too. 😅

## Gardener Compatibility to v1.39

A lot of work went into catching up with the Gardener release cycle and bringing our software closer to their latest release. With this metal-stack release, we were able to cycle our Gardener integration through 12 patch versions of the Gardener now supporting Gardener up to v1.39. We hope that we can keep this pace and catch up with the Gardener development team in order to provide all the latest features of the Gardener for our metal-stack clusters very soon. Bear with us!

## More Information

This is only a small extract of what went into our v0.11.0 release.

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.11.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
