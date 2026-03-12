---
title: Kamaji's multi-tenant control-plane on top of metal-stack
shortDescription:
watermark: 'Blog'
date: 
description: A showcase of kamaji on top of metal-stack using the mini-lab
authors: [mac641, ma-hartma]
type: 'blog'
tags:
  - architecture
  - kamaji
  - mini-lab
---

Managing multiple Kubernetes clusters shouldn’t mean juggling dedicated machines for every control plane. Kamaji changes
the game by running control planes as pods within a single Management Cluster, slashing operational overhead while
ensuring isolation and scalability. Built on upstream Kubernetes and integrated with kubeadm and Cluster API, Kamaji
delivers a seamless, cost-effective way to deploy and manage clusters whether in private clouds, public clouds, or edge
environments. Its infrastructure-agnostic design lets you connect worker nodes from anywhere, making hybrid and
multi-cloud deployments effortless. In this blog post we're going to show you how Kamaji can be utilized with
metal-stack in the mini-lab.

## Architecture

![](./overview-kamaji.drawio.svg)
