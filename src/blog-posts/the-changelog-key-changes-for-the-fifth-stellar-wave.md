---
title: 'The Changelog: Key Changes for the Fifth Stellar Wave'
excerpt: Here's what's new for Stellar Wave 5
date: 2026-05-22
coverImage: >-
  /assets/blog-images/the-changelog-key-changes-for-the-fifth-stellar-wave/coverImage.png
coverImageAlt: >-
  Abstract Illustration of a developer at a laptop, surrounded by Wave-related
  imagery
author:
  - kat
  - jason
categories:
  - wave
  - product
announcementBannerCopy: 'The Changelog: What''s New For Stellar Wave 5'
---
The fifth Stellar Wave is [launching on **May 26th**](https://www.drips.network/wave/stellar) — and we're dedicating this cycle to strengthening our foundation, improving fairness, and optimizing the backend systems that keep the program running smoothly.

With Stellar Wave 4 wrapped up, we’ve taken your feedback and our data to heart. While a lot of the work for Wave 5 has happened under the hood, we are also shipping a few highly requested user-facing updates to make the experience fairer and more seamless for everyone. Here is what's coming.

### Expanding Points Budgets: Introducing Per-Organization Caps

In Wave 4, we introduced per-repository points budgets to ensure a balanced distribution of rewards. The feedback was overwhelmingly positive, but it also highlighted the next logical step: stopping ecosystem dominance at the organizational level.

For Wave 5, we are introducing an additional, secondary limit on the total number of points that can be accumulated by a single **GitHub Organization**.

- **The Initial Cap:** Initially, this will be set to **75k points per organization** per Wave cycle.
- **Why we’re doing it:** This ensures that large multi-repo ecosystems don’t unintentionally crowd out smaller, independent repositories from the reward pool, and prevents side-stepping the per-repo limits by deliberately fanning out into many, highly specific repos.
- **Monitoring:** Just like our repository caps, we will closely monitor how this initial threshold performs throughout Wave 5 and tune it as we learn.

As a project maintainer, you can always check on your per-repo and per-org points budgets on the [**Orgs & Repos dashboard**](https://www.drips.network/wave/maintainers/repos).

We recognize that a one-size-fits-all cap won't fit every single ecosystem perfectly. If your organization maintains an unusually large number of active, distinct projects, we are open to reviewing and individually tweaking these limits. If you believe your setup warrants an exception, please reach out to us with a  detailed breakdown of your projects, and we will evaluate adjustments on a case-by-case basis.

[Learn more about the new org limits in our docs](https://docs.drips.network/wave/maintainers/points-budgets).

### Upfront Identity Verification for a Smoother, Fairer Experience

Previously, identity verification / KYC (Know Your Customer) was only required at the end of a Wave when a contributor was ready to withdraw their grants. Starting in Wave 5, **KYC is now required upfront before participating.**

We are making this shift for two core reasons:

1. 💸 **Eliminating Payout Slowdowns:** Waiting until the end of a Wave to process KYC sometimes created bottlenecked queues and delivery delays for your grants. Moving verification to the front ensures that once a Wave ends, your rewards can move as fast as possible.
1. 🦾 **Tightening Sybil Resistance:** Enforcing identity verification from day one gives us a much cleaner, safer environment, preventing bad actors from attempting to game the system with automated or duplicate accounts before they even begin.

**The vast majority of identity verifications are automatically approved within 5 minutes**, and if you're a new contributor in Wave 5, you [can get started now](https://www.drips.network/wave/kyc).

If you're having trouble verifying, please reach out to our [support team](https://drips.network/wave/support) via the chat widget or email. If you've already previously verified your identity, nothing changes for you - you're good to go!

### Refining the AI-Based Points Appeal Process

When a contributor completes an issue but doesn't receive points, often due to an unresponsive maintainer, they can request an automated appeal by clicking "I didn't receive points for an issue" on our Discord's `🎫│tickets` channel. Our AI system then steps in to analyze the Pull Request, assess code quality, and ensure the contribution adequately addresses the underlying issue.

Based on maintainer feedback and a large swath of data collected during previous Waves, we’ve made significant tweaks to this AI process for Wave 5 to make it smarter and fairer:

- 🧐 **Better Maintainer Context:** The AI now more reliably detects and takes into account direct feedback from maintainers on the PR, such as specific review comments.
- ⏰ **Fairer Review Timelines:** We have tightened our timing guidelines to ensure maintainers are guaranteed a fair amount of time to review PRs naturally before points are automatically evaluated and issued.
- 🤓 **Deeper Code Analysis:** We optimized the model to ensure it thoroughly reviews all relevant parts of the code in all cases, leading to a much more accurate and informed judgment.

As always, we welcome your feedback and hands-on observations on how the AI behaves. If you spot any unexpected behavior, please report it to us so we can continue to fine-tune the system.

### Strengthening Stability and Integrity Behind the Scenes

Flashy features are great, but platform health is what keeps the ecosystem thriving. For Wave 5, our engineering team heavily prioritized stability improvements, optimization, and bug fixes to make the core platform experience faster and more reliable.

Crucially, we have invested deeply in building advanced internal systems to monitor and **identify rule-breaking and adverse behavior**. These tools allow us to spot  exploitative actions much quicker than before, giving us the telemetry needed to take fast, informed actions.

As we mentioned last month, keeping the details of our detection methods under wraps is vital for system integrity. Rest assured, these background adjustments are designed to help protect the rewards pool for the real, hard-working contributors who deserve it.

### An Update on Customer Support Response Times

We want to acknowledge that our Customer Support response times have been slower than usual lately. We know how frustrating it is to wait when you have questions or need assistance, and we sincerely apologize for the delay.

Please know that we are actively working to fix this. We are currently:

- 👥 **Expanding our team** by onboarding additional support staff.
- 🤖 **Automating common request types** to clear out simpler queries faster and free up our team for complex cases.

We are fully committed to resolving every single CS case as quickly as we can. If you are currently waiting on a response, we truly appreciate your patience as we get our support operations up to speed.

### Looking ahead

Stellar Wave 5 represents a major milestone in making this program sustainable for the long haul. By focusing on fairness, backend resilience, and operational health, we are ensuring that Drips remains the best place to fund and build open-source software.

Stellar Wave 5 launches on **May 26th.** Make sure you're [opted into the newsletter](https://www.drips.network/wave/newsletter), check in on our [Discord](https://discord.gg/t8XBXZAEs5), and let's keep building together!
