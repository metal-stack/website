---
title: metal-stack v0.22.0 🎃
shortDescription:
watermark: "Blog"
date: 2025-10-28T10:00:00+01:00
authors: [gerrit91]
description: "This release comes with support for the Gardener Operator and enhanced Cluster API integration tests."
type: "blog"
tags:
  - release
  - kubernetes
  - network
---

This release has come a long way, and it's finally here. In this version of metal-stack, we expect all users with an existing Gardener integration to migrate to the Gardener Operator. This blog article briefly describes how this can be done and what other changes are included in this release.

- [Gardener Operator](#gardener-operator)
- [Cluster API Integration](#cluster-api-integration)
- [SBOMs for Release Artifacts](#sboms-for-release-artifacts)
- [MEP-4 in Alpha Stage](#mep-4-in-alpha-stage)
- [Improvements on SONiC Integration](#improvements-on-sonic-integration)
- [Gardener Ontap Extension](#gardener-ontap-extension)
- [More Information](#more-information)

Check out the direct link to the release [here](https://github.com/metal-stack/releases/releases/tag/v0.22.0).

## Gardener Operator

With the introduction of the [Gardener Operator](https://gardener.cloud/docs/gardener/concepts/operator/), the Gardener Project has started to provide a standardized way to deploy and manage Gardener installations for the community. It comes with a lot of beneficial traits allowing high-availability of the Virtual Garden (no downtime during updates anymore), provisioning extensions through OCI artifacts and enforced kubeconfig secret rotation such that there is no static admin kubeconfig anymore, etc.

Historically, metal-stack shipped with an own approach for deploying the Gardener through the [metal-roles](https://github.com/metal-stack/metal-roles) based on Ansible. It utilized the upstream helm charts for the Gardener Control Plane and a self-managed Virtual Garden Helm chart (which was based on the garden-setup repository). Luckily, these charts are now obsolete, minimizing the maintenance burden, and it's sufficient to rely on a single Helm chart during the deployment: The one that sets up the Gardener Operator. So, we still ship the Ansible roles but with a new set of Ansible roles that  are using Gardener Operator resources to install the Gardener.

In general, the migration path that we use is described [here](https://github.com/metal-stack/metal-roles/tree/master/control-plane/roles/gardener-operator#migration-path). The idea is to restore the data of the Virtual Garden from the backup, re-registering the existing Gardenlets and migrating the shooted seeds to a new Gardenlet. As the migration of existing production setups can be pretty complex, please reach out to us at our Slack Community. We're here to help if necessary.

After this release, we will try to catch up with the most recent Gardener releases again in order to be able to provide K8s 1.33 support soon.

## Cluster API Integration

Another big aspect of this release are extended integration tests for the [cluster-api-provider-metal-stack](https://github.com/metal-stack/cluster-api-provider-metal-stack). The tests are running in the big integration suite hosted at the FI-TS, ensuring compatibility with our metal-stack components for every release from now on. This makes Cluster API an integral part for providing Kubernetes on metal-stack for users that do not rely on the Gardener integration.

The release adds new OS images on images.metal-stack.io that include expected components for Cluster API bootstrapping like `kubeadm`.

The tests for the provider are based on the official [e2e framework](https://cluster-api.sigs.k8s.io/developer/core/e2e). For now, they only include cluster creation tests. In the following releases we will work on extending the test cases and we are also planning to run CNCF conformance tests against CAPI clusters, too.

## SBOMs for Release Artifacts

In order to provide a common basis for identifying software vulnerabilities, all our release artifacts consistently contain an SPDX-formatted software bill of material now. Usually, we embed the SBOM directly into the container artifacts using Buildx. Please note that these SBOMs are also available for the OS images of metal-stack.

Using these artifacts for CVE scanning can be done pretty easily. Please find examples for this in our documentation on [metal-stack.io/docs](https://metal-stack.io/docs/sbom).

This task was mainly driven by (@mac641)[https://github.com/mac641]. Kudos to him!

## MEP-4 in Alpha Stage

MEP-4 is definitely the longest running enhancement proposal that we have ever worked on. It finally makes it to the alpha stage and is soon to be expected to become GA. It contains an entire update of the metal-stack API, deprecating the Swagger-based REST API and replacing it with [protobuf](https://protobuf.dev/) and [ConnectRPC](https://connectrpc.com/).

The project that implements our [V2 API definition](https://github.com/metal-stack/api) is called the [metal-apiserver](https://github.com/metal-stack/metal-apiserver). The implementation is capable of creating API tokens with fine-grained access permissions, such that technical components can access the metal-stack API with minimum access privileges and without the possibility to reach into unintended project and tenant scopes.

In addition to that, the network business layer was completely modernized, such that it will be possible to set up namespaced networks for allocating IP addresses, creating super networks (scoped and unscoped) instead of just having a single super network for a partition, and more.

Also, the metal-apiserver drops the dependency on NSQ and will instead use [valkey](https://valkey.io/) to introduce asynchronous task queueing for the implementation of more complex endpoints.

The metal-apiserver is already deployed in mini-lab by default. You can access it using the [metalctlv2 CLI](https://github.com/metal-stack/cli). There are also first Ansible modules available using the fairly new and awesome [connect-python](https://github.com/connectrpc/connect-python) project for implementation.

We will keep you informed on the development progress. If you want to contribute thoughts to the new API you may want to visit our [public planning meetings](https://metal-stack.io/docs/planning-meetings) and discuss ideas together with us.

## Improvements on SONiC Integration

A lot of work from our contributor [@iljarotar](https://github.com/iljarotar) was put into improving and stabilizing SONiC switches over the course of this year. The deployment now follows a completely new approach using a [generator](https://github.com/metal-stack/sonic-configdb-utils) to provide a `config_db.json`.

In case you still use the `sonic` role we advise operators to migrate to the [sonic-config](https://github.com/metal-stack/metal-roles/tree/master/partition/roles/sonic-config), which utilizes the generator for the switch configuration.

Another important step was made in the mini-lab, which now allows spinning up the lab with different versions of SONiC. In our integration tests we can also ensure support for Enterprise now. We're aiming for more sophisticated testing of different flavors of SONiC to suit more real-world scenarios.

## Gardener Ontap Extension

As another storage solutation in Gardener setups, we included beta integration for [NetApp ONTAP storage](https://www.netapp.com/de/ontap-data-management-software/). This integration is provided by a dedicated Gardener extension, which is called [gardener-extension-ontap](https://github.com/metal-stack/gardener-extension-ontap).

To make this work, we would like to mention [@honigeintopf](https://github.com/honigeintopf) and thank him for the huge amount of efforts to build this extension.

## More Information

Please check out the [release notes](https://github.com/metal-stack/releases/releases/tag/v0.22.0) to find a full overview over every change that went part of this release.

As always, feel free to visit our Slack channel and ask if there are any questions. 😄
