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

First and foremost, I would like to say that, once again, this year's journey to Brussels was an absolute bliss. Talking to this amount of people in such a short period of time is truly overwhelming. It brings you in touch with the open source community in a way that would never seem possible through the the internet. And it makes us thankful to be able to reach out to you on this place.

The "smallest functional metal-stack installation" that [@qrnvttrl](https://github.com/qrnvttrl) brought to our stand in Brussels was an absolute eye-catcher. It was such a good starting point for conversations and it allowed us to show data center technology in a very compact, functional setup for the first time. Quirin even offered to write a blog article about it to provide some background information on how it came into existence and what parts were used to build it (I guess a lot of people wanted to know it more precisely, so keep an eye on the blog to find out soon).

With the [metal-ui](https://github.com/metal-stack/metal-ui) that [@ostempel](https://github.com/ostempel) implemented specifically for the FOSDEM, it became so much easier to show you the possibilities of our new V2 API (as described in [MEP-4](https://metal-stack.io/docs/next/MEP-4-multi-tenancy-for-the-metal-api)). Thanks Oliver for bringing this shiny little thing to our stand and showing it to people! In my opinion we should invest more time into it, give people a chance to contribute to the repository in case they see a need for managing metal-stack not only through CLI but also through a native desktop application.

From speaking to so many people, it became even more apparent than last year, that the current policitical world situation forces many deciders and engineers to explore sovereign infrastructure technology. The times are definitely over when we were asked why one should not just move all the workload to the cloud. Almost everybody had an understanding by now what chances are in there for Europe to define our version of data and cloud sovereignty. We are more than happy if we can give back something to you with the metal-stack project on your journey to modern data center infrastructure. It was really incredible that so many of you actively approached us and just wanted to talk and know more about what we do.

Another thanks goes out to the organizers of the event and all the people who made the conference possible. It's a safe space for everyone who attends and you can just be who you are. We appreciate this a lot. During a really good Belgian beer this weekend the following sentence was said (not sure if I am allowed to say who said it, but it was great): Computer science is a treasure that contains the intelligence of our planet. Everybody can contribute to that. Openly and without fear.

To round up this blog article, I would like to include some of the most common questions we heard at the conference. In many aspects we never really covered them somewhere on the web, so I guess it's a good moment to answer them here. Of course, you can also ask again in case we meet one day. 😛

*Does this run on Raspberry Pi?*

Unfortunately, we do not release many ARM64 artifacts by now. Depending on which parts you want to run on a Raspberry Pi it would mean to add the build to all our repositories, which in our opinion burns quite a lot of resources without having an idea what should be done with it. If there's a more serious need to release artifacts for certain platforms, we are more than happy to add it to our CI. Please reach out to us, if you need it. ARM64 artifacts are specifically built already for [csi-driver-lvm](https://github.com/metal-stack/csi-driver-lvm) or [metalctl](https://github.com/metal-stack/metalctl).

*Can I install this in my home lab?*

Theoretically, yes. Theoretically, you can do a lot of things. 🤓

metal-stack is definitely classified as data center technology and installing this at home is kind of overkill. Using metal-stack makes sense the bigger your environment gets because you can manage thousands of servers with a very small amount of people. Maybe consider the company you work for to use metal-stack, it's more likely to fit it there than at home.

However, for educational purposes, like learning about networking, booting Linux, switches and so on, metal-stack might be a really good playground for that. Specifically [https://containerlab.dev/] turned out to be a really cool project to test out ideas regarding network topologies and using BGP in the data center. This is used in our virtual lab, called the [mini-lab](https://github.com/metal-stack/mini-lab), too.

*When did you start?*

We started in 2018 with metal-stack and went into production with the software in 2020. Today, we manage more than 2000 servers with metal-stack and we do not see any particular bottlenecks yet. Through the years, we are quite confident to say you can use it for production, too.

*But if you're open source, how do you make money with this? Do you offer support for this?*

As we are a consulting company: Yes, we do offer support for metal-stack! We can help you to plan, support and operate Kubernetes as a Service on Bare Metal in your own data center and also have experts on digital transformation regarding other topics. If you need more information on who we are, check out [https://x-cellent.com/](https://x-cellent.com/).
