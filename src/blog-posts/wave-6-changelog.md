---
title: "The Changelog: What's New in Stellar Wave 6"
excerpt: >-
  The sixth Stellar Wave is launching on June 23rd — here's what's new, from
  smarter contributor dashboard filtering to further review bot improvements.
date: 2026-06-22
coverImage: '/assets/blog-images/wave-6-changelog/coverImage.jpg'
coverImageAlt: Illustration showing a Wave on Drips Wave
author:
  - kat
  - jason
categories:
  - wave
  - product
announcementBannerCopy: "The Changelog: What's New in Stellar Wave 6"
---

The fifth Stellar Wave has wrapped up, and as always, we've used your feedback and our data to sharpen the experience for the next one. The sixth Wave is [launching on **June 23rd**](https://www.drips.network/wave/stellar), and this cycle brings a smarter contributor dashboard, more refinements to our automatic issue review bot, and a new safeguard to keep repo applications fair. Here's what's coming.

## 🎯 Smarter Contributor Dashboard Filtering

We want the contributor dashboard to surface the issues that actually matter to you right now, without you having to dig for them.

Starting in Wave 6, the dashboard defaults to showing issues that you've **applied to in the current Wave** and that are **open and either assigned to you or unassigned**, alongside any issues that have **carried over from previous Wave(s)**. The result is a view focused on the work that's most relevant to you at this moment, rather than a long list you have to manually narrow down.

![Screenshot of the new contributor dashboard assignment filter, showing the 'Assigned to me or unassigned' option](/assets/blog-images/wave-6-changelog/contributor-dashboard-filter.png)

Of course, the filters remain fully customizable. If you'd rather browse all open issues, see only what's assigned to you, or build your own view, you can adjust the status and assignment filters at any time — the new behavior is just a smarter starting point.

💡 **A quick tip:** Filter configuration is fully preserved in the page's URL. If you find yourself repeatedly setting the same filter config, just bookmark it in your browser!

## 🤖 Further Issue Review Bot Enhancements

As always, we're continuing to tune the automatic issue review bot. Based on your feedback, this Wave brings a batch of meaningful improvements to how it evaluates contributions:

- 🔬 **Overhauled CI/CD awareness:** We completely reworked the way the bot pulls in CI/CD status, ensuring it doesn't issue points when CI indicates clear gaps in a contribution.
- 📄 **Full diff visibility:** We fixed situations where the bot may not have been able to view the entire diff, leading to a more complete and accurate assessment. In cases where the diff does not fit into the bot's context window, we now escalate to our mod team for a manual review.
- ⏳ **Stale PR safeguard:** We added a safeguard against pull requests that are significantly behind main receiving automatic points.
- 👤 **Correct assignment checks:** We fixed a rare case where the bot could issue points to a user who was no longer assigned to the issue in question, but opened a PR anyway.

As always, we welcome your hands-on observations on how the bot behaves. If you spot it misbehaving, please send us feedback by opening a ticket on our [Discord](https://discord.gg/t8XBXZAEs5) — we're constantly tweaking the system, and these reports genuinely help us make it fairer.

## 🛡️ New Limits on Repo Applications

To protect program integrity and reduce spam, we're introducing a new limit on repo applications in Wave 6.

Going forward, there's a maximum of **5 repo applications per Wave cycle** for everyone, enforced both **per-user and per-org**. On top of that, **KYC is now required to submit a repo application.**

These changes bring repo applications in line with the identity and rate-limit safeguards we already apply elsewhere across the program, helping ensure that the application process stays focused on genuine, high-quality projects.

You'll now see your remaining repo application limits as the first step of the repo application process. These limits reset with every new Wave.

[Learn more about the new repo application limits in our docs](https://docs.drips.network/wave/maintainers/repo-application-limits).

## ⚡ A Faster Issues List

We also spent time this cycle making the issues list noticeably quicker to load and browse. Under the hood, we moved the list over to cursor-based pagination and tuned the underlying queries, so paging through issues is faster and smoother — and hovering over an issue no longer reloads the whole list. It's a behind-the-scenes change, but one you should feel right away as you work through the Wave.

## 🛠️ Behind the Scenes

As always, alongside the headline changes there's a long list of smaller improvements shipping in Wave 6 — countless behind-the-scenes tweaks to gaming detection, performance, stability, and bug fixes that keep the program healthy and running smoothly.

For the integrity of the system, we don't share the specifics of our gaming detection methods, but rest assured this ongoing work is all in service of protecting the rewards pool for the real, hard-working contributors who deserve it.

Please **continue reporting any adverse behavior** you spot during the Wave. You can report users on their Wave profiles, repos on the Wave → Repos screen, and even specific issues on any issue listing view. **While we cannot individually respond to every single report**, reports help us **focus our mod team's attention** to the most impactful places.

## 🔭 Looking ahead

These are the headline changes for Stellar Wave 6, and as always, we appreciate your feedback and suggestions as we keep refining the program together.

Stellar Wave 6 **launches on June 23rd.** If you haven't already, [join our Discord and link your Drips Wave account](https://www.drips.network/wave/link-discord), and let's keep building a vibrant open-source ecosystem together!
