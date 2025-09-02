---
slug: /enhancement-proposals
title: Enhancement Proposals
sidebar_position: 1
---

# Metal Stack Enhancement Proposals (MEPs)

This section contains proposals which address substantial modifications to metal-stack.

Every proposal has a short name which starts with _MEP_ followed by an incremental, unique number. Proposals should be raised as pull requests in the [website](https://github.com/metal-stack/website) repository and can be discussed in Github issues.

The list of proposals and their current state is listed in the table below.

Possible states are:

- `In Discussion`
- `Accepted`
- `Declined`
- `In Progress`
- `Completed`
- `Aborted`

Once a proposal was accepted, an issue should be raised and the implementation should be done in a separate PR.

| Name                      | Description                                    |      State      |
| :------------------------ | :--------------------------------------------- | :-------------: |
| [MEP-1](MEP1/README.md)   | Distributed Control Plane Deployment           |   `Declined`    |
| [MEP-2](MEP2/README.md)   | Two Factor Authentication                      |    `Aborted`    |
| [MEP-3](MEP3/README.md)   | Machine Re-Installation to preserve local data |   `Completed`   |
| [MEP-4](MEP4/README.md)   | Multi-tenancy for the metal-api                |  `In Progress`  |
| [MEP-5](MEP5/README.md)   | Shared Networks                                |   `Completed`   |
| [MEP-6](MEP6/README.md)   | DMZ Networks                                   |   `Completed`   |
| MEP-7                     | Passing environment variables to machines      |   `Declined`    |
| [MEP-8](MEP8/README.md)   | Configurable Filesystemlayout                  |   `Completed`   |
| [MEP-9](MEP9/README.md)   | No Open Ports To the Data Center               |   `Completed`   |
| [MEP-10](MEP10/README.md) | SONiC Support                                  |   `Completed`   |
| [MEP-11](MEP11/README.md) | Auditing ^of metal-stack resources             |   `Completed`   |
| [MEP-12](MEP12/README.md) | Rack Spreading                                 |   `Completed`   |
| [MEP-13](MEP13/README.md) | IPv6                                           |   `Completed`   |
| [MEP-14](MEP14/README.md) | Independence from external sources             |   `Completed`   |
| MEP-15                    | HAL Improvements                               | `In Discussion` |
| [MEP-16](MEP16/README.md) | Firewall Support for Cluster API Provider      | `In Discussion` |
| [MEP-17](MEP17/README.md) | Global Network View                            | `In Discussion` |
| [MEP-18](MEP18/README.md) | Autonomous Control Plane                       | `In Discussion` |

## Proposal Process

1. Before starting a new proposal, it is advised to have a quick chat with one of the maintainers.
2. Create a draft pull request in the [website](https://github.com/metal-stack/website) repository with your proposal. Your proposal doesn't have to finished at this point.
3. Share the PR in the [metal-stack Slack](https://metal-stack.slack.com/) and invite maintainers to review it.
4. The review itself will probably take place in multiple iterations. Don't be discouraged if your proposal is not accepted right away. The goal is to reach consensus.
5. Once your proposal is accepted, create an umbrella issue in the relevant repository or when multiple repositories are involved in the [releases](https://github.com/metal-stack/releases).
6. Other issues should be created in different repositories and linked to the umbrella issue.
7. Unless stated otherwise, the proposer is responsible for the implementation of the proposal.

## How to Write a Good MEP

In the first section of your MEP, start with the current situation and the motivation for the change. Summarize your proposal briefly.

Next follows the main part: describe your proposal in detail. Which parts of of metal-stack are affected? Are there API changes? If yes, describe them and provide examples here.
Try to think of side effects your proposal might have. Try to provide a view on how your proposal affects users of metal-stack.

After the main part of your proposal, feel free to add additional sections, e.g. about alternatives that were considered, non-goals or future possibilities.

Depending on the complexity of your proposal, you might want to add a section about the implementation plan or roadmap.

You can have a look at the existing MEPs for inspiration. As you will notice: not every MEP has the same structure. Feel free to structure your MEP in a way that makes sense for your proposal.
