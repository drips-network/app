---
title: 'Creating Meaningful Issues: A Guide for Maintainers'
date: '2026-01-14'
coverImage: '/assets/blog-images/good-issues.png'
coverImageAlt: 'Illustration of a good issue with sparkles'
excerpt: 'A practical framework for maintainers to write issues that attract the right contributors, reduce back-and-forth, and lead to better outcomes.'
author: 'ugo-x'
categories:
  - guide
  - wave
---

Welcome to Drips Wave. Whether this is your first time setting issues or you are a seasoned maintainer, the quality of the issues you post will shape how successful your Wave is. Clear, well-scoped issues help contributors do their best work and help you get meaningful progress on your project.

This guide is a practical walkthrough for making the most of Waves by writing high-quality issues that work well with the Drips points system.

# Why Issue Quality Matters

If you’re a maintainer, the issues you publish set the tone for your whole contributor experience. In Waves, issue quality becomes even more important because it shapes what people build, how they collaborate, and whether the work actually moves your project forward.

Well-crafted issues do a few powerful things at once:

- Attract serious contributors
- Keep progress focused
- Build a community that wants to stick around, not just pop in and disappear

# The Pitfalls of Low-Value Issues

Dropping low-effort issues just to “have issues” is a fast way to weaken your project and your community. It leads to:

- Low-quality contributions that don’t move the product forward
- Frustration for serious developers investing time in dead-end work
- A culture of short-term participation instead of long-term building

Every issue is an opportunity. Don’t waste it.

## Five Principles for Creating Meaningful Issues

### 1\. Focus on Real Impact

Before you publish an issue, ask: does this meaningfully improve the product, developer experience, or user outcomes?

If the answer is “meh,” rethink it. Waves move fast. You want issues that create momentum, not noise.

### 2\. Provide Clear Context

Give contributors the why, not just the what. Share the background, the problem, and what “done” should look like.

Context helps contributors make better decisions without constantly asking for clarification.

### 3\. Define Scope Appropriately

Issues should be completable within a single Wave cycle.

Too big equals overwhelming. Too small equals pointless.

Find the balance. If it’s large, break it into smaller related issues. If it feels trivial, combine it with related work or remove it entirely.

### 4\. Include Implementation Guidelines (Without Micromanaging)

Offer direction, not handcuffs.

Point contributors toward:

- Key files or modules
- Design references
- Edge cases to watch for
- Constraints such as performance, security, or UX requirements
- How you want the change validated

Leave room for contributors to apply their own judgement, but set expectations clearly.

### 5\. Be Explicit About Expectations and Complexity

Contributors shouldn’t have to guess what you expect. If your issue is vague, you’ll spend the entire Wave answering basic questions instead of reviewing good PRs.

Be clear about:

- What “done” looks like
- How you’ll review the work
- What must be included in the PR

In Drips Wave, you must also tag issue complexity clearly according to the points system. When expectations and complexity are clear, contributors ship faster and reviews are smoother.

## How Points Work in Drips Waves (and Why Complexity Matters)

In Drips Waves, each issue should be tagged with a complexity level, which maps directly to points.

When a contributor completes an issue and their PR is merged, they earn the points assigned to it. At the end of the Wave, rewards are paid from a shared pool, and points determine how that pool is split. Because of this, how you scope issues and tag complexity has a direct impact on how fair the Wave feels.

Points are a trust signal. They tell contributors how much effort and responsibility a task involves. If points are inflated or underpriced, trust breaks down and contribution quality suffers.

As a maintainer, the goal is simple: match complexity to the real scope and impact of the work.

Complexity guidelines:

- **Trivial (100 points)**  
  Small, clearly bounded changes with obvious acceptance criteria
- **Medium (150 points)**  
  Standard features or logic touching multiple parts of the codebase
- **High (200 points)**  
  Complex engineering work such as integrations or architectural changes

Tag issues honestly. Don’t inflate easy work or underprice hard tasks. When contributors feel points are fair, you attract builders who care about the work, not just the reward.

### Recognising Work That Goes Above and Beyond

After a Wave ends, maintainers can award Compliments to recognise contributions that genuinely exceed expectations. These are best used sparingly and intentionally, as a way to highlight exceptional work rather than to rebalance points.

## Meaningful vs. Low-Value Issues (Real Examples)

Below are a few real examples showing the difference between quality issues and low-value ones.

### Frontend Development

Great issue: Build the Claim and Burn Token Interface

> **Description**  
> Implement a claim and burn UI with toggle functionality and proper wallet states.
>
> **Requirements and context**
>
> - Follow Figma design: \[Figma link\]
> - Match UI transitions and wallet states accurately
> - Ensure responsiveness
>
> **Suggested execution**
>
> - Fork the repo and create a branch  
>   `git checkout -b feature/claim-burn`
>
> **Implement changes**
>
> - Build component: `components/claim-burn.tsx`
> - Implement wallet connection states
> - Create toggle buttons for claim and burn
> - Maintain state transitions and visual feedback
>
> **Test and commit**
>
> - Test wallet states and UI interactions
> - Verify responsive layout
> - Include screenshots or gifs in the PR
>
> **Example commit message**  
> `feat: add claim/burn UI and wallet states`
>
> **Guidelines**
>
> - Assignment required before starting
> - PR description must include: `Closes #[issue_id]`

**Low-value issue to avoid**

> Fix button styling on homepage  
> “Please update the button color to match our brand.”

No clear impact, no context, and not worth a contributor’s time.

### Backend or Smart Contract Development

Great issue: Implement Token Vesting Contract

> **Description**  
> Develop a contract with a time-locked release mechanism.
>
> **Requirements and context**
>
> - Must be secure, tested, and documented
> - Should be efficient and easy to review
>
> **Suggested execution**
>
> - Fork the repo and create a branch  
>   `git checkout -b feature/token-vesting`
>
> **Implement changes**
>
> - Write contract: `TokenVesting.sol`
> - Write comprehensive tests: `TokenVesting.test.js`
> - Add documentation: `vesting.md`
> - Include NatSpec-style comments
> - Validate security assumptions
>
> **Test and commit**
>
> - Run tests
> - Cover edge cases
> - Include test output and security notes
>
> **Example commit message**  
> `feat: implement token vesting with tests and docs`
>
> **Guidelines**
>
> - Minimum 95 percent test coverage
> - Clear documentation
> - Timeframe: 96 hours

**Low-value issue to avoid**

> Fix typo in an error message  
> “Fix typo in transfer function error message.”

It’s not meaningful, and it doesn’t justify Wave attention.

## Building a Stronger Open Source Community

Open source is more than code. It’s people, trust, and long-term momentum.

When you create meaningful issues, you:

- Help contributors build real-world skills
- Elevate your project’s reputation and output
- Foster a culture of serious contribution
- Build a community that comes back because the work actually matters

Rewards are nice. Points are useful. But the real win is building something meaningful together.

Create issues like your community’s time matters. Because it does. 🌊

If anything is unclear, you can always reach out to the team for clarification or [check the docs](https://docs.drips.network/wave).

**Let’s make some waves 🌊**
