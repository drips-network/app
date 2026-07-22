---
title: "The Changelog: What's New in Stellar Wave 7"
excerpt: >-
  The seventh Stellar Wave launches on July 23rd — here's what's new, from a new
  appeal process for rejected repo applications to a much faster app on slow
  connections.
date: 2026-07-22
coverImage: '/assets/blog-images/wave-7-changelog/coverImage.png'
coverImageAlt: >-
  Illustration of software and infrastructure icons — code brackets, a branch
  diagram with a checkmark, gears turning in a browser window, coins, a server
  stack, and a breaking wave
author:
  - kat
  - jason
categories:
  - wave
  - product
announcementBannerCopy: "The Changelog: What's New in Stellar Wave 7"
---

The sixth Stellar Wave has wrapped up, and we've spent this cycle on the things you told us got in your way. The seventh Wave [launches on **July 23rd**](https://www.drips.network/wave/stellar), and it brings a proper appeal process for rejected repo applications, a substantially faster app — particularly on slower connections — and a batch of fixes to the issue review bot. Here's what's coming.

## 🙋 Appealing a Repo Application Rejection

Until now, if your repo application was declined, that was more or less the end of the conversation. Some of you improved your projects significantly afterwards and had no clear way to tell us. Starting in Wave 7, there's a real process for that.

You can now **appeal a rejection directly in the app**. Head to the **Maintainers → Orgs and Repos** dashboard, find the rejected repository, and click **Appeal**. We'll ask what development work and improvements you've made since the rejection, and your appeal goes to our review team.

A few rules apply:

- 🗓️ You can submit your first appeal **two weeks** after the initial rejection.
- ⏳ If an appeal is declined, there's a **one-month cooldown** before you can appeal again.
- 🔢 Each repository can be appealed a **maximum of three times**.

Important to know: appeals are only reconsidered when there has been **substantive change** - meaningful improvements to the code, project quality, and relevance to the Stellar ecosystem. If nothing material has changed, the decision won't change — and a frivolous appeal still uses up one of your three. So: make them count!

⚠️ **Appeals must now be submitted through the app.** Appeals sent by email, Discord, or through any other channel will be ignored.

[Learn more about the appeal process in our docs](https://docs.drips.network/wave/maintainers/participating-in-a-wave).

## ⚡ A Faster Wave, Especially on Slower Connections

A large share of the Wave community contributes over mobile and other connections where every round trip and every kilobyte is felt. We spent a big chunk of this cycle on exactly that, and it's the change we think you'll notice most immediately.

Most of that work went into cutting out waste in the frontend — code and data the app was downloading whether you needed it or not:

- 📦 **The repo filter on the issues pages was loading roughly 250KB on every single page view** — even when the filter panel was collapsed and you never opened it. It now loads only when you actually open the dropdown.
- 👛 **Wallet libraries, the share flow, and the sign-in button** no longer load upfront on every page. They load when you need them.
- 🗂️ **Contributor issue views** were fetching up to 100 full repository records that were only ever used by the maintainer "add to Wave Program" flow. That fetch is gone for everyone who can't use it.
- ⏱️ **Issues page data was loading sequentially** due to a subtle bug, when it should have been loading in parallel. Now it does.
- 🎨 We also inlined critical styles, pre-rendered image variants, and warm up the connection to the Wave API earlier.

Behind the scenes, we moved our heaviest listing endpoints over to cursor-based pagination and hardened the rest against slow deep-page queries, and built a load-testing harness that reproduces the traffic surge of a Wave opening in a lab environment. The first hour of a Wave is when the app is under the most strain, and we'd rather find our limits there than with you watching.

## 🔧 Fewer Surprises for Maintainers

Three long-standing papercuts, fixed.

**Private repos now explain themselves.** Wave only ever syncs public repositories, but if you selected a private repo while installing the GitHub App, it simply never appeared — with no explanation. This sent a lot of maintainers into a loop of reinstalling the app trying to fix something that wasn't broken. Onboarding now tells you directly when your installation includes private repos that won't sync, and why. Relatedly, if you make a private repo public, its existing issues now get pulled in properly instead of only appearing once they see new activity.

**Repo transfers no longer lose your approval.** Transferring a repository between GitHub organizations used to silently drop its Wave Program approval, its tags, and its featured status. The repo would quietly fall out of the Program with nothing to indicate why. Approvals and tags now carry across transfers.

**Issues assigned outside of Wave are handled properly.** You can no longer add an issue that's already assigned to someone on GitHub to a Wave Program — the app now blocks it upfront and tells you exactly which issues were skipped and why, instead of failing opaquely. And if a Wave issue gets assigned to someone who didn't apply through Wave, our bot now posts a comment explaining the situation and how to remove the issue from the Program if you'd rather not have a Wave applicant on it.

## 🤖 Issue Review Bot: Smarter About CI, No More Dead Ends

Last month we described a set of changes to how the review bot handles CI status. Those changes shipped — and in production, they turned out to be too strict.

The clearest example: pull requests from forks often trigger deploy previews that report a failure reading something like "Authorization required to deploy." That's not a broken contribution. It's a permission that only a maintainer can grant, and there is nothing the contributor can do about it. Under the strict gate, those PRs got blocked before the AI ever looked at the code.

So we've changed the approach. **CI results now inform the AI's judgment rather than overriding it.** The bot sees each failing check along with the reason it failed, so it can distinguish a genuinely contributor-actionable failure — failing tests, build errors — from one that isn't. Checks that are genuinely still running will still wait for a result.

Alongside that:

- 🔓 **You can no longer get locked out of claiming points.** Our appeal limit was counting the automatic assessments that run whenever you push to a PR. If you iterated on your work enough times, you could exhaust the limit and be told "this issue has already been reviewed multiple times" — before you'd ever manually requested points once. The limit now only counts appeals you actually initiate.
- 🚪 **Rejections aren't dead ends anymore.** If the bot rejects your contribution over something like a flaky or misconfigured check, you now get the full assessment along with an appeal button, rather than being stranded with no path to a human. Merge conflicts are the exception — those get a clear "resolve the conflicts and request points again" reply, since that's something you can fix directly.
- ⏰ **Maintainers now get 72 hours** before automatic assessment kicks in, up from 24. This gives you a genuine window to review contributions naturally before the bot weighs in.
- 🧑‍⚖️ **Competing PRs escalate to a human.** When several open PRs target the same Wave issue, a moderator now decides rather than the bot picking automatically.
- 💬 **Discord replies are more useful,** showing the bot's actual reasoning instead of a generic message.

As always, we welcome your hands-on observations. If you spot the bot misbehaving, open a ticket on our [Discord](https://discord.gg/t8XBXZAEs5) — these reports genuinely shape how we tune the system.

## ⚙️ Faster Test Transactions

Test transactions are the last step before you can receive grants, and they've been slower than we'd like — especially on the day we sent everyone their reward grants.

We reworked how transactions are submitted and **increased throughput by roughly 2.8x**. Test transactions should now go out substantially faster than before.

We're not done here. **Wallet parallelization is next on our list**, with the goal of making test transactions practically instant even during peak demand.

## 🎫 Support and Status

Getting help on Discord used to mean choosing between four separate entry points, and it was rarely obvious which one you needed — so a lot of you ended up in the wrong place and waited longer than you should have.

That's now **a single message in the `🎫│tickets` channel**, with three options:

- 🔐 **Sensitive requests** — anything touching KYC, identity, or grants points you to the [Wave Support Hub](https://www.drips.network/wave/support), where you can reach us by email or in-app chat. This kind of thing shouldn't go through Discord in the first place.
- 🤖 **Automatic Issue Appeal** — the existing flow for when you didn't receive points for an issue.
- 🎫 **General ticket** — everything else. Opens a private channel with our team.

General tickets are new, and they run on our own Wave Discord bot rather than the third-party one we used before — so your Wave and GitHub profiles come through with the ticket, and our moderators can help you without a round of back-and-forth first.

We've also launched a brand new status page at **[status.drips.network](https://status.drips.network)**. It gives you a fully transparent incident history, real-time notifications whenever any part of Drips is degraded, and **45 days of uptime history** for every component — so you can see exactly how the platform has been performing over time, not just how it's doing right now.

That page is now wired directly into the app, too. If something is degraded or down, a global banner will tell you wherever you are, with a link straight through to the details — so you no longer have to check Discord to work out whether it's you or us.

And a small quality-of-life change for contributors: we've removed the "issue application received" notification you got after applying to an issue. It made up a large share of all the notifications we send while telling you something you already knew — you see the confirmation in the app and in the GitHub comment straight away. Maintainers still get notified when an application comes in, so nothing changes on that side.

💡 **A quick reminder:** you're always in control of what we send you. Head to [**Wave → Settings → Notifications**](https://www.drips.network/wave/settings/notifications) to pick exactly which notifications you receive, and whether each one reaches you by email, in the app, or both.

## 🛡️ Behind the Scenes

As always, there's a long list of smaller improvements shipping alongside the headline changes — a great many behind-the-scenes tweaks to gaming detection, performance, stability, and bug fixes that keep the program healthy.

For the integrity of the system, we don't share the specifics of our detection methods, but rest assured this ongoing work is all in service of protecting the rewards pool for the real, hard-working contributors who deserve it.

Please **continue reporting any adverse behavior** you spot during the Wave. You can report users on their Wave profiles, repos on the Wave → Repos screen, and specific issues on any issue listing view. **While we cannot individually respond to every report**, they help us **focus our mod team's attention** on the most impactful places.

## 🔭 Looking ahead

These are the headline changes for Stellar Wave 7, and as always, your feedback is what drives most of them.

Stellar Wave 7 **launches on July 23rd.** If you haven't already, [join our Discord and link your Drips Wave account](https://www.drips.network/wave/link-discord), and let's keep building a vibrant open-source ecosystem together!
