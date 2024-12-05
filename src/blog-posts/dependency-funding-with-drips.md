---
title: 'Dependency Funding with Drips'
date: '2023-07-26'
coverImage: '/assets/blog-images/drips-logo.png'
coverImageAlt: 'Drips Logo'
excerpt: 'In the vast realm of software development, one concept has always stood out as a testament to the interconnected nature of our modern society: the software dependency tree.'
author: 'ele'
---

This intricate web of dependencies vividly illustrates how our collective progress relies on the collaborative efforts of countless individuals and projects. **It reveals a profound truth—that we are all interdependent, and our success hinges upon the success of others.**

At the heart of this idea lies an intriguing question:

> What if we could engineer new structures that harness our interdependency, empowering us to support the very communities and public goods we rely on most for our success?

This question has driven our quest to reimagine how FOSS (Free and Open-Source Software) projects can become financially resilient, leading us to develop a solution that we call Drips.

[Drips](https://drips.network/) is a decentralised toolkit born out of our personal experiences, learnings and challenges contributing to and maintaining large, complex FOSS software stacks. These invaluable projects form the backbone of our digital infrastructure, powering everything from the websites we visit to the phones in our pockets, to the software tools we use daily. However, the longevity and stability of these software stacks are threatened by the absence of sustainable economic models that adequately compensate the dedicated developers and maintainers behind them.

# Building on Existing Success Stories

As we embarked on this endeavour, we recognised the importance of learning from existing solutions. Several platforms have emerged in recent years, each with its own strengths and weaknesses. Below, we consider some notable examples and examine how they have contributed to the public goods space.

# Donation Platforms

Recurring donation platforms like [Github Sponsors](https://github.com/sponsors), [Patreon](https://www.patreon.com/), and [OpenCollective](https://opencollective.com/) have significantly transformed the landscape of financial support for creators and developers. While each platform brings its unique contributions to the funding ecosystem, there are also drawbacks that should be taken into account.

[Github Sponsors](https://github.com/sponsors) harnesses the network effects and power of Github's large user base, streamlining the process for developers already on the platform to receive financial backing with ease. [Patreon](https://www.patreon.com/), on the other hand, has differentiated itself with its membership-based model that enabled developers to offer tier-based benefits and incentives in exchange for financial support. Meanwhile, [OpenCollective](https://opencollective.com/) has left a cultural impact by empowering engineers to establish or join entities and obtain funding at the project level, fostering a strong sense of community support.

However, most of these platforms face limitations such as misaligned (or lack of) incentives for donors, high fees, location restrictions, and bureaucratic hurdles. Most importantly, they struggle to effectively leverage the interconnected relationships between software projects, meaning that the success of one project does not guarantee success for its software dependents.

# Novel Experiments

The emergence of crypto-networks has sparked a renewed interest in developing new solutions for public goods funding, and it is within this landscape that Drips operates.

[Gitcoin](https://www.gitcoin.co/) stands as a massive inspiration in aligning incentives between developers and supporters in novel ways. Its campaign-based, [quadratic funding](https://www.gitcoin.co/blog/quadratic-funding) mechanism has generated substantial financial contributions to open-source projects, especially within the Ethereum ecosystem. [Gitcoin](https://www.gitcoin.co/) has provided a fresh take on community allocation of capital and has inspired more experiments in the public goods space. However, its one-off nature means that funding is not predictable or continuous. This lack of predictability poses challenges for both supporters and developers — but particularly for developers who require ongoing financial support to sustain their work.

Another compelling experiment is [Protocol Guild](https://protocol-guild.readthedocs.io/en/latest/), which effectively asks the question: “if we curated a public list of the Ethereum developers most active in building the core protocol, would organisations and individuals building on Ethereum be willing to fund that list?” Perhaps surprisingly, the answer is a resounding “yes”, with around $10M USD donated to the guild as of December 7, 2022. While it is still a one-off experiment coordinated by a group of developers, rather than a funding platform per-say, Protocol Guild (and its funders) have provided an inspiring real-world example at scale of how dependency funding can work – and of how this mechanism can boost the financial success of an entire interdependent software ecosystem.

Finally [RetroPGF](https://app.optimism.io/retropgf), proposed by Vitalik Buterin and adopted by the [Optimism Collective](https://app.optimism.io/announcement), has served as the biggest inspiration for our endeavour and closely aligns with the core vision behind Drips. The core principle behind the concept of the retroactive support of public goods is simple: it’s easier to agree on what was useful than what will be useful. Optimism’s take on [RetroPGF](https://app.optimism.io/retropgf) **linked the profits of the Collective with the Public Goods that the collective values**, aligning incentives between the two and **paving a way for public goods to become “profitable”**.

# Drips

[Drips](https://drips.network/) follows a similar retroactive focus, but takes the idea even further, by offering:

1. a generalised platform and application for similar experiments
2. a simple, streamlined process tailored to software projects and
3. the option to use a continuous payout.

![The Drips Splitting Graph](/assets/blog-images/splitting-graph.png)

**At the core of the Drips user experience is the idea of a Drip List.** This is a collection of Ethereum addresses, ENS names and Git repositories curated by an individual user or organisation and packaged together under one title. This list is accompanied by a percentage (of funds to be received) allocated to each item on the list. These lists are publicly available, shareable on the web and open for anyone to support, **effectively forming a graph of software projects and contributors**. This allows anyone to curate a list of recipients and provide context about them, effectively signalling to other supporters by setting an example. All of this makes it simpler to discover projects and people in need in your ecosystem and transparently support them by flowing funds through the graph.

![An example Drip List](/assets/blog-images/drip-list.png)

**In addition, Drips allow anyone to support the recipients on the lists with any ERC-20 tokens, either as a one-off transaction or as a continuous stream settled by the second.** By enabling users to stream funds on a per-second basis, Drips provides a level of granularity and flexibility that was previously unseen in similar platforms. Streaming is a powerful way for organisations to align incentives with recipients over a long period of time. Supporters now have the ability to cancel the remaining stream at any time, providing them with complete control and the freedom to adapt their support based on evolving circumstances.

**Finally, Drips reduces friction, radically simplifying the process for both supporters and the projects they support.** The permissionless and decentralised infrastructure of Ethereum ensures that anyone, regardless of their location, can effortlessly create an account in the Drips protocol to send or receive ERC-20 tokens.

In fact, Drips goes a step further by offering an optional, oracle-based identity solution, powered by Chainlink. This feature enables users to directly send funds to the owners of public software repositories on Github, even if its owners don't have an Ethereum address or prior experience with the Ethereum ecosystem. They can simply send their support, confident that it will reach its intended destination. On the other side, project owners can effortlessly claim the funds sent to them by adding a FUNDING.json file on the default branch of their public repository with their preferred Ethereum address. This feature facilitates frictionless support for FOSS projects worldwide. It also democratises access to the network effects that were traditionally available only to established platforms, now making them accessible to everyone.

![How Drip Lists work](/assets/blog-images/how-drip-lists-work.png)

In essence, Drips serves as an off-the-shelf solution for direct and recurring financial support, allowing organisations to effortlessly allocate ongoing ERC-20 tokens to the projects they consider essential and to link their success to the success of their dependents.

# What’s possible now?

We hope the new primitives and platform offered by Drips, coupled with the permanent, public, and composable nature of Ethereum, will inspire a multitude of exciting experiments that could be brought to life by others in the Public Goods space:

1. **Programmatically linking a DAO's proceeds to the success of its software dependents**, by automatically allocating a percentage of a DAO's proceeds to its dependents, forging a direct financial connection between the DAO and the projects it supports. This approach incentivises the DAO's success to become intertwined with the achievements of its dependents.

2. **Distributing ownership and decision-making power to your project’s dependents.** By continuously and programmatically distributing native tokens to a project’s dependents, a DAO can align its stakeholders' interests with the success of the projects the DAO supports. This approach ensures that the growth and prosperity of the DAO are intrinsically tied to the well-being of its dependents.

3. **Introducing [hypercerts](https://hypercerts.org/) to acknowledge and reward those supporting public goods**, where individuals or entities supporting public goods receive special certifications as a form of recognition and appreciation.

4. Making funding public goods a collaborative effort: By enabling the integration of any governance model reflected on the Ethereum state, **Drips opens up the possibility of multiplayer involvement in managing on-chain lists of public goods.**

# Proposal to allocate $1m USD to Radworks dependencies

As part of this launch, we are also very happy to announce a proposal on the Radworks forum to allocate $1m over a year to the key dependencies of Orgs within the Radworks ecosystem!

# How to get involved?

If you’re interested in supporting the public goods that YOUR project depends on, we would be happy to help you get onboarded to Drips.

If we truly desire a society capable of creating and nurturing these indispensable FOSS software stacks for the long haul, we must confront the urgent need for financial resilience. Collectively we can forge sustainable economic models that nourish our interconnected communities, cultivate thriving public goods, and ensure the longevity of the software that underpins our digital world.✌️
