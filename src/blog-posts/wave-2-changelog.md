---
title: 'The Changelog: Key Improvements for Stellar Wave 2'
date: '2026-02-16'
coverImage: '/assets/blog-images/wave-cover.png'
coverImageAlt: 'Illustration showing a Wave on Drips Wave'
excerpt: "The second Stellar Wave is launching on February 19th - here are some of the key improvements we're making based on your feedback and our learnings."
author: 'jason'
announcementBannerCopy: 'The Changelog: Key Improvements for Stellar Wave 2'
categories:
  - wave
  - product
---

Last month, [we launched Drips Wave](/blog/posts/the-monthly-wave), a recurring bounty cycle that helps ecosystems attract open-source contributions. FOSS maintainers add issues, contributors resolve them, and earn Points that translate to on-chain rewards.

The first Wave for the Stellar ecosystem wrapped up only a few weeks ago, and we've been overwhelmed by the response. In just ten short days, almost 600 participants merged over 3,000 PRs across 200+ repositories. We've said it many times, but once again: THANK YOU to everyone who participated in the first Wave, and thank you to Stellar for making all this possible.

The next Wave is already [scheduled to hit on February 19th](/wave/stellar), and we've been hard at work building several key improvements based on your feedback and our learnings. Without further ado – here's our first Changelog, breaking down key improvements for Stellar Wave 2.

## Introducing Application Quotas

In the first Wave, a few very eager contributors sent a large number of applications and ended up being assigned to many issues, while others struggled to get their foot in the door. Early in the Wave, we quickly added a count of current assignments and points earned to the application card in order to give maintainers more context when assigning issues – and we quickly saw a more even distribution of assignments.

For Stellar Wave 2, we're taking things one step further by introducing two new limits on applications and assignments:

- **Pending application limit**: Contributors can only have 15 pending or assigned applications at a time. This encourages contributors to be more selective about the issues they apply for, and gives more contributors a chance to be assigned to issues. Of course, contributors can "free up a slot" by resolving an issue they've been assigned to, or by withdrawing an application.

- **Contributor-per-org limit**: Each org can assign the same contributor to a maximum of 7 issues across their repos, throughout the entire Wave. This encourages maintainers to spread assignments across a wider, more diverse pool of contributors.

We believe that these limits will enhance the quality of applications as contributors more deliberately select issues to apply for, and give more contributors a chance to be assigned to issues.

## Replacing Compliments with Post-Contribution Surveys

While we loved the positive vibes that Compliments brought to the Wave, we realized that they weren't providing the level of feedback that helps both contributors and maintainers truly grow.

For Stellar Wave 2, we're replacing Compliments with more detailed post-contribution surveys. Both maintainers and contributors will get a chance to leave detailed, anonymous feedback on their experience working together.

<video src="/assets/blog-videos/wave-2-changelog/review-survey.mp4" autoplay loop muted playsinline></video>

Once we've collected enough data, we'll begin delivering **personalized, private insights** within the Wave app - helping contributors and projects grow Wave-over-Wave.

## Filtering Issues by Repo Languages

Applying this new filter allows drilling down to issues from repos that have a significant portion of code written in the selected language(s), helping contributors find tasks that match their skillset and interests more quickly.

![Screenshot of the new language filter on the issues page](/assets/blog-images/wave-changelog/issue-language-filter.png)

As we continue to collect valuable data from everyone's contributions and preferences, we're planning to ship further enhancements to the issue discovery process.

## Browse Orgs, new Org Profiles, and Discord Linking

Communication between maintainers and contributors is key to successful PRs, and GitHub comments aren't always the most efficient channel.

This is why we added new Org Profiles, which display contact information from the GitHub Org synced in real-time, plus a list of org members signed up to Drips Wave. We encourage all maintainers to add any Discord servers, Telegram groups, or other communication channels to their GitHub Org profiles, so that contributors can easily reach out with questions or updates.

<video src="/assets/blog-videos/wave-2-changelog/org-browsing.mp4" autoplay loop muted playsinline></video>

Everyone can now also link their Discord account to their Drips Wave profiles by typing `/link` anywhere on our [Discord server](https://discord.gg/t8XBXZAEs5) – and linked Discord handles appear directly on Wave profiles.

## Easier PR-to-Issue Linking

In the first Wave, contributors sometimes forgot to link their PR to the issue they were assigned to, resulting in points not automatically being awarded upon merge.

To make the Wave smoother for both maintainers and contributors, we're making our handy GitHub Bot **automatically remind contributors to link their PRs to issues** if it sees an unlinked PR from a Wave contributor.

![Screenshot of the new PR linking reminder comment](/assets/blog-images/wave-changelog/pr-link-reminder.png)

A single click from the contributor appends the necessary keyword to the PR description, ensuring points are issued quickly and accurately.

## Enhanced Issue Application Table

To help maintainers find the best contributor for their issues, we've overhauled the issue applications list with new sorting options, alongside an optional **compact table view**.

<video src="/assets/blog-videos/wave-2-changelog/application-picker.mp4" autoplay loop muted playsinline></video>

We look forward to enhancing the application review experience with additional metrics and filters in coming Waves.

## Battling Spam and Bad Actors

Like any public bounty platform, Drips Wave isn't immune to bad actors - but we aren’t sitting idle. To protect the integrity of the ecosystem, we’re rolling out several safeguards for Stellar Wave 2.

Our new application and applicant-per-org limits, combined with significant under-the-hood measures, are designed to curb spam and prevent self-dealing. We’ve also integrated unobtrusive captchas at key points in the user journey to block automated bots without slowing down real contributors.

Finally, we’re leaning on the reporting tools introduced during the tail end of the first Wave. If you see suspicious behavior or rule-breaking issues, flag them. We’re committed to keeping this competition fair and rewarding for those doing the real work.

# Looking ahead

These are just some of the many improvements we're making for Stellar Wave 2, and we already have a long list of ideas in the pipeline for the future. We can't wait to share more of these with you in the coming months, and as always, we welcome your feedback and suggestions. You can share your thoughts in our [Discord server](https://discord.gg/t8XBXZAEs5) in the "feature-requests" channel anytime.

Stellar Wave 2 **launches on February 19th**. If you haven't already, be sure to opt in to the [newsletter](/wave/newsletter), check out our [Discord](https://discord.gg/t8XBXZAEs5), and join us in building a more vibrant open-source ecosystem together!
