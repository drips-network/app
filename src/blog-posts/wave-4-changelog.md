---
title: "The Changelog: What's New in Stellar Wave 4"
date: '2026-04-20'
coverImage: '/assets/blog-images/wave-cover.png'
coverImageAlt: 'Illustration showing a Wave on Drips Wave'
excerpt: "The fourth Stellar Wave is launching on April 22nd - here are the most significant changes we're shipping based on your feedback and our learnings."
author:
  - kat
  - jason
announcementBannerCopy: "The Changelog: What's New in Stellar Wave 4"
categories:
  - wave
  - product
---

The 3rd Stellar Wave wrapped up last month, and it was another step forward for the program. Thanks to your feedback and the lessons we picked up along the way, we're shipping some of the **most significant changes** we've made so far. In this post, we'll share what's coming in the 4th Wave, which is [scheduled to hit on 22 April](/wave/stellar).

## Introducing Points Budgets per Repo

Across Waves 1, 2, and 3, we've steadily refined how points move through the program — tightening application limits, scaling rewards quadratically, and strengthening identity and Sybil defenses. For Wave 4, we're adding a new lever that works at the repo level: **per-repo points budgets**.

Wave Programs can now configure a points budget that caps the total points any single repository can contribute per Wave cycle. This helps ensure no one repo dominates the reward pool, and encourages a more balanced distribution of issues across all participating repositories.

Here's how it works in practice:

- Each approved repo is individually capped at the configured budget per Wave. Budget is counted on **base points plus complexity bonuses, before any featured multiplier is applied** — which means featured repos can add the same number of issues as non-featured ones.
- The budget is enforced whenever an issue is added to the Program — whether through the dashboard or via the GitHub label workflow. If adding an issue would push a repo over budget, the action is blocked. If someone applies the Wave label to an issue that would exceed the budget, the label is automatically removed and the Drips Wave bot posts a comment explaining why.
- Decreasing an issue's complexity or removing an issue from the Program is always allowed, even if the repo is currently over budget.
- Budgets reset at the end of each Wave cycle. Resolved issues from past Waves fall off the budget entirely. Unresolved issues carry over and continue to count until they're completed or removed.

Maintainers can check their status anytime on the **Maintainers → Orgs & Repos** page, which now shows "Points used" and "Points budget" for each approved repo.

Practically, this means maintainers will want to think a bit more carefully about **which issues to add to the Program each Wave**. Prioritize the most impactful work, and set complexity levels accurately — balancing trivial and complex issues to make the most of your budget. For the full details, see the [points budgets docs](https://docs.drips.network/wave/maintainers/points-budgets).

We'll monitor how budgets perform over Wave 4 and tune as we learn.

## Sunsetting the Public Leaderboard

For Wave 4, we're **sunsetting the public leaderboard**.

We've seen the leaderboard pull too much attention toward day-to-day ranking dynamics, instead of toward doing good work. We want Wave to be about building and contribution quality, not constant position-checking.

To be clear, nothing about how contributions are reviewed or how points are awarded is changing. We've already made meaningful changes to keep Wave fair — including tighter application limits, quadratic reward scaling, and stronger identity and Sybil verification — and that work continues in Wave 4 with the introduction of repo budgets.

We're treating this as a product decision for Wave 4 and we'll evaluate it at the end of the Wave. Constructive feedback is always welcome via email at **support@drips.network**.

## Keeping Wave Fair

Fairness has been a consistent thread through every Wave, and it remains a top priority in Wave 4. We've gathered data across multiple Waves and made many background adjustments based on what we've seen.

Contributions are reviewed carefully, and we take action when needed — **including removing contributors or projects that break the rules**. Enforcement is ongoing and will continue throughout Wave 4.

For the integrity of the system, we don't share specifics on how we detect or handle rule breaking — doing so would only make the system easier to exploit. What we can say is that the combination of quadratic reward scaling, identity and Sybil verification, application limits, and now per-repo points budgets gives us a much more robust toolkit for keeping Wave healthy. We'll keep tightening it as the program grows.

## Welcoming the Codigo Alebrije Cohort

We're excited to welcome the [projects joining us from the **Codigo Alebrije hackathon**](https://www.drips.network/wave/stellar/repos?filters=eyJzb3J0QnkiOiJzdGFyZ2F6ZXJzQ291bnQiLCJ0YWdJZCI6ImI1ODI4OTAyLWNhNDItNDcyNS1hMDA5LWMzNWEwOWVhNDE4OSJ9) into Wave 4. It's a fantastic cohort, and we can't wait to see how your contributions build out their projects over the course of the Wave.

A big welcome from the whole Wave community — we're glad to have you here.

## Looking ahead

These are the headline changes for Stellar Wave 4, but as always, there's a longer list of smaller enhancements shipping alongside them. We always welcome your feedback and suggestions.

Stellar Wave 4 **launches on April 22nd**. If you haven't already, be sure to opt in to the [newsletter](/wave/newsletter), check out our [Discord](https://discord.gg/t8XBXZAEs5), and join us in building a more vibrant open-source ecosystem together!
