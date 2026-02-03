---
title: Looking back at FOSDEM 2026
shortDescription:
watermark: "Blog"
date: 2026-02-03T11:00:00+02:00
description: "What an event! Please read the recap on this year's visit of the biggest Open Source conference we have in Europe."
authors: [gerrit91]
type: "blog"
tags:
  - news
  - conferences
---

First and foremost, I would like to say that, once again, this year's journey to Brussels was an absolute bliss. Talking to this number of people in such a short period of time is truly overwhelming. It brings you in touch with the open-source community in a way that would never seem possible through the internet. And it makes us thankful to be able to reach out to you in this place.

<!-- truncate -->

## The "smallest functional metal-stack installation"

The DIY-rack that [@qrnvttrl](https://github.com/qrnvttrl) brought to our stand in Brussels was an absolute eye-catcher. It was built for his bachelor thesis at [FI-TS](https://www.f-i-ts.de/) and is such a good starting point for conversations. It allowed us to show data center technology in a very compact, functional format for the first time. Quirin even offered to write a blog article about it to provide some background information on how it came into existence and what parts were used to build it. I guess a lot of people wanted to know it in more detail, so keep an eye on the blog to find out soon.

## We have a GUI?

With the [metal-ui](https://github.com/metal-stack/metal-ui) that [@ostempel](https://github.com/ostempel) implemented specifically for the FOSDEM, it became so much easier to show the possibilities of our new V2 API (as described in [MEP-4](https://metal-stack.io/docs/next/MEP-4-multi-tenancy-for-the-metal-api)). Thanks Oliver for bringing this shiny little thing to our stand and showing it to people! In my opinion we should invest more time into it, give people a chance to contribute to the repository in case they see a need for managing metal-stack not only through CLI but also through a desktop application.

## People noticeably shifting to sovereign infrastructure

From speaking to so many people, it became even more apparent than last year, that the current political world situation forces many deciders and engineers to explore sovereign infrastructure technology. The times are definitely over when we are asked why one should not just move all the workload to the cloud. Almost everybody had an understanding by now of what chances are in there for Europe to define our version of data and cloud sovereignty. We would be more than happy if we can give back something to you with the metal-stack project on your journey to modern data center infrastructure. It was really incredible that so many of you actively approached us and just wanted to talk and know more about what we do.

Another thanks go out to the organizers of the event and all the people who made the conference possible. It's a safe space for everyone who attends, and you can just be who you are. We appreciate this a lot. During a perfect Belgian beer this weekend, the following sentence was said (not sure if I am allowed to say who said it, but it was great): Computer science is a treasure of our planet that represents what we're able to achieve. It's collective intellectual property and everybody can contribute to that. Openly and without fear. 🍻

![](./fosdem_2026.jpg)
> Before the tide comes in.

## Frequently Asked Questions

To round up this blog article, I would like to include some of the most common questions we heard at the conference. In many respects, we never really covered them anywhere on the web, so I guess it's a good moment to answer them here. Of course, you can also ask again if we meet one day. 😛

### **Does this run on Raspberry Pi?**

Unfortunately, we do not release many ARM64 artifacts by now. Depending on which parts you want to run on a Raspberry Pi it would mean to add the build to all our repositories, which in our opinion burns quite a lot of resources without having an idea what should be done with it. If there's a more serious need to release artifacts for certain platforms, we are more than happy to add it to our CI. Please reach out to us, if you need it. ARM64 artifacts are specifically built already for [csi-driver-lvm](https://github.com/metal-stack/csi-driver-lvm) or [metalctl](https://github.com/metal-stack/metalctl).

### **Can I install this in my home lab?**

Theoretically, yes. Theoretically, you can do a lot of things. 🤓

metal-stack is definitely classified as data center technology and installing this at home is kind of overkill. The bigger your environment gets, the more value you can get from metal-stack. It enables a small team of just a few people to manage thousands of servers. Maybe consider the company you work for to use metal-stack, as it fits their needs more likely than at home.

However, for educational purposes, like learning about networking, booting Linux, switches and so on, metal-stack might be a perfect playground for that. Specifically, [containerlab](https://containerlab.dev/) turned out to be a really cool project to test out ideas regarding network topologies and using BGP in the data center. This is used in our virtual lab, called the [mini-lab](https://github.com/metal-stack/mini-lab), too.

### **When did you start?**

We started in 2018 with metal-stack and went into production with the software in 2020. Today, we manage more than 2000 servers with metal-stack, and we do not see any particular bottlenecks yet. Through the years, we are quite confident to say you can use it for production.

### **But if you're open source, how do you make money with this? Do you offer support for this?**

As we are a consulting company, Yes, we do offer support for metal-stack! We can help you to plan, support and operate Kubernetes as a Service on Bare Metal in your own data center and also have experts on digital transformation regarding other topics. If you need more information on who we are, check out [https://x-cellent.com/](https://x-cellent.com/).

Also keep in mind we have a hosted version of metal-stack that is named [metalstack.cloud](https://metalstack.cloud).

### **What sets your solution apart from similar projects like OpenStack Ironic or Ubuntu MaaS?**

When we built metal-stack we wanted to make it a driver for Kubernetes as a Service in an on-premise data center. For this reason, we are more opinionated on certain topics than other projects. For example:

- **Networking**: The network is part of the solution of metal-stack. We require BGP in the data center and a switch that can run [metal-core](https://github.com/metal-stack/metal-core) to dynamically apply port reconfiguration during machine allocation. With this, we can lower operational overhead, run [Kubernetes CNIs](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/) with native routing (i.e. without overlay networks), provide services of type `LoadBalancer` with [MetalLB](https://metallb.io/) and achieve efficient routing even in case of failover.
- **Firewalls**: We did not want to see any more big external firewalls that hold a complex state. This is why firewalls are an essential part of our infrastructure that can be managed by the [firewall-controller](https://github.com/metal-stack/firewall-controller) through Kubernetes resources. This brings firewall rules as close as they get to the applications that require them and are automatically cleaned up when, for instance, the service resource does not exist anymore.
- **Slim and Fast**: Kubernetes needs to be able to scale quickly, and we wanted the provisioning process to be really quick. The provisioning time of a machine (depending on the vendor) can take only a minute. We wrote everything in Go in an API-driven manner such that users can easily access services without requiring manual interaction from operators.
- **Runs on K8s but also without**: We want metal-stack to not rely on Kubernetes per se. We have an imperative REST (soon only gRPC) API that does not require the Kubernetes API to operate. To us, this provides us the best of two worlds: Staying open to future platforms (because we're not locked into Kubernetes) while utilizing effective infrastructure under the hood to run the control plane.
