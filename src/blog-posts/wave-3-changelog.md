---
title: "The Changelog: What's New in Stellar Wave 3"
date: '2026-03-19'
coverImage: '/assets/blog-images/wave-cover.png'
coverImageAlt: 'Illustration showing a Wave on Drips Wave'
excerpt: "The third Stellar Wave is launching on March 23rd - here are some of the key improvements we're making based on your feedback and our learnings."
author: jason
announcementBannerCopy: 'The Changelog: Key Improvements for Stellar Wave 3'
categories:
  - wave
  - product
---

The 2nd Stellar Wave wrapped up last month, and it was bigger and better than the first. Thanks to your feedback and insights, the [many improvements](/blog/posts/wave-2-changelog) we made had a significant impact. In this post, we'll review the impact of some of the changes, and share what's coming in the 3rd Wave, which is [scheduled to hit on March 23rd](/wave/stellar).

## Reflecting and Doubling Down on Application Limits

By popular demand, we introduced two limits on issue applications in the last Wave:

- Contributors could have a maximum of 15 "pending" applications at any given time, encouraging applicants to more carefully consider what issues to apply to, and limiting the impact of spam.
- Each contributor could resolve a maximum of 7 issues from any given org, ensuring more applicants get a chance to participate, and dampening the dominance of any single contributor.

**The impact of these limits was great**. Compared to Wave 1, we saw a much more diverse set of contributors resolving more issues, spread across more orgs, and a significant reduction in spammy applications.

![Graphs showing the distribution of points earned and number of repos active in for Wave 1 and 2. In Wave 2, outliers on points earned have been mitigated, and more contributors are earning points across more repos.](/assets/blog-images/wave-changelog/wave-point-curves.png)

As you can see in the graphs, the new limits resulted in a **significantly flatter points distribution**, with most contributors earning close to the median amount of points. Additionally, the average participant contributed to **vastly more unique repositories**, rather than concentrating on a few.

For this reason, we're doubling down by **lowering the limit of issues being resolved by the same contributor in any given org from 7 to 4**.

## Tweaking Reward Calculations

In Wave 1, final rewards were calculated linearly based on the amount of points earned by each contributor. In Wave 2, as some of you have already noticed, we experimented with a **quadratic scaling** approach – a well-established mechanism in game design, designed to dampen the impact of farming and focus on rewarding meaningful contributions. As a result, **top achievers still received the biggest portions** of the pool, but the **overall distribution became flatter**, and outliers were prevented from monopolizing rewards.

Given the positive community reaction, we'll **continue with quadratic reward scaling in Wave 3**.

## Defending Against Sybil Attacks in Real-Time

While quadratic reward scaling is great, it comes with an increased risk of **Sybil attacks**, in which a single user creates multiple accounts to capture a broader share of the reward pool.

Drips Wave already leverages one of the strongest possible Sybil defenses: **KYC identity verification being required for withdrawing rewards**. However, due to KYC processes sometimes being complex and lengthy, we want to avoid requiring upfront KYC verification for all participants.

That's why, with Wave 3, we're rolling out more in-depth, **real-time Sybil defense mechanisms** designed to detect and mitigate Sybil attempts _during_ the Wave. The system will analyze a broad set of factors as users participate, and autonomously raise certain challenges when deemed necessary. These challenges range from a **quick CAPTCHA** to **phone number verification**, and in extreme cases, even an **upfront KYC requirement**.

As the new Wave hits, we'll monitor the performance of this system closely and make frequent tweaks under the hood.

## AI-Assisted Workflows for Increased Momentum

We're introducing a first set of **experimental AI-assisted workflows**, designed to reduce friction in the contribution process for both contributors and maintainers.

<br/>

---

### Automated Quota Release

Some time after linking a PR to an issue, you may see our handy GitHub Bot notify you about the issue no longer counting against your application quota, allowing you to apply for another issue while waiting on a review. The bot assesses the PR for its significance, ensures it matches the acceptance criteria of the linked issue, and automatically releases the quota if there is reasonable confidence that the PR will be merged.

We hope that this reduces the burden on maintainers reviewing PRs quickly, as contributors are less pressured to rush their PR getting merged.

### Automatic Issue Points Appeal

In past Waves, contributors would sometimes forget to link their PRs to issues, or maintainers would require some time to properly review PRs, resulting in delays in point allocation and frustration for contributors.

To address this, we're introducing an **automatic issue points appeal** process. If your contribution was accepted by a maintainer, but you didn't receive points, or a maintainer is being unresponsive for over 24 hours, you can now trigger an automated review directly from the **Tickets channel** on our Discord.

Simply click the **"I didn't receive Points for an Issue"** button, select the issue in question, and submit a link to your PR. If the system determines that the PR has already been accepted, or is very likely to be accepted if it were reviewed, it will automatically issue Points for the contribution. In unclear cases, a ticket will be created, and a moderator will review it.

<br/>

---

<br/>

These new AI-assisted workflows are **experimental**. We'll continuously monitor performance, and review whether the AI decisions retroactively align with human maintainer decisions. As always, we **welcome your feedback** on these changes.

## Issue Application Process Tweaks

In Wave 3, we're making two key tweaks to the issue application process:

- **Applicants can edit their applications**: No more need to withdraw and re-apply to an issue if you'd like to improve your application. A new "Edit" button will allow you to edit your pending application directly, also updating the application comment on GitHub.
- **Maintainers can explicitly reject applications**: Sometimes, maintainers were hesitant to pick an applicant to their issues as they were still waiting for someone with the right profile to apply. This created an annoying situation in which contributors received no feedback on their pending application, which kept counting against their application limits. Now, maintainers can explicitly reject applications in this scenario, allowing contributors to immediately apply to other issues.

# Looking ahead

These are just some of the many improvements we're making for Stellar Wave 3, and as always, we have a long list of additional enhancements planned for the future. We always welcome your feedback and suggestions, which you can share on our [Discord server](https://discord.gg/t8XBXZAEs5) in the "feature-requests" channel anytime.

Stellar Wave 3 **launches on March 23rd**. If you haven't already, be sure to opt in to the [newsletter](/wave/newsletter), check out our [Discord](https://discord.gg/t8XBXZAEs5), and join us in building a more vibrant open-source ecosystem together!
