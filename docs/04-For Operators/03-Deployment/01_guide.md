---
slug: /deployment-guide
title: Guide
sidebar_position: 1
---

# Deployment Guide

We are bootstrapping the [metal control plane](../../05-Concepts/01-architecture.mdx#metal-control-plane) as well as our [partitions](../../05-Concepts/01-architecture.mdx#partitions) with [Ansible](https://www.ansible.com/) through CI.

In order to build up your deployment, we recommend to make use of the same Ansible roles that we are using by ourselves in order to deploy the metal-stack. You can find them in the repository called [metal-roles](https://github.com/metal-stack/metal-roles).

In order to wrap up deployment dependencies there is a special [deployment base image](https://github.com/metal-stack/metal-deployment-base/pkgs/container/metal-deployment-base) hosted on GitHub that you can use for running the deployment. Using this Docker image eliminates a lot of moving parts in the deployment and should keep the footprints on your system fairly small and maintainable.

This document will from now on assume that you want to use our Ansible deployment roles for setting up metal-stack. We will also use the deployment base image, so you should also have [Docker](https://docs.docker.com/get-started/get-docker/) installed. It is in the nature of software deployments to differ from site to site, company to company, user to user. Therefore, we can only describe how the deployment works for us. It is up to you to tweak the deployment described in this document to your requirements.

:::warning
Probably you need to learn writing Ansible playbooks if you want to be able to deploy the metal-stack as presented in this documentation. However, even when starting without any knowledge about Ansible it should be possible to follow these docs. In case you need further explanations regarding Ansible please refer to [docs.ansible.com](https://docs.ansible.com/).
:::

:::info
If you do not want to use Ansible for deployment, you need to come up with a deployment mechanism by yourself. However, you will probably be able to re-use some of our contents from our [metal-roles](https://github.com/metal-stack/metal-roles) repository, e.g. the Helm chart for deploying the metal control plane.
:::

:::tip
You can use the [mini-lab](https://github.com/metal-stack/mini-lab) as a template project for your own deployment. It uses the same approach as described in this document.
:::
