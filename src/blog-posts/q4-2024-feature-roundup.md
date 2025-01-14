---
title: 'Q4 Feature Roundup: Gasless claiming, Filecoin, Embeddable support buttons'
date: '2024-12-18'
coverImage: '/assets/blog-images/feature-roundup-q4-2024.png'
coverImageAlt: 'Collaborative Drip List illustration'
excerpt: "Let's review some of the exciting new features we shipped this quarter."
author: 'jason'
announcementBannerCopy: 'Drips launches Gasless Claiming on Filecoin, embeddable support buttons, and more'
---

Happy New Year from the Drips team & we’re kicking it off with a new tradition: quarterly blog updates to keep you in the loop about our latest features, achievements, and plans for the future.

Q4 was a busy time for us at Drips — alongside our entire team [attending Devcon SEA in Bangkok](https://x.com/dripsnetwork/status/1859174903133405211), we've also been hard at work launching Drips on an entirely new chain, and shipping a number of key improvements all across our platform. Let's dive a little deeper into some of the biggest new features launched in Q4!

# 💧 Drips drops on Filecoin

We're immensely excited to partner with the Protocol Labs ecosystem as the distribution mechanism of choice for [FIL-RetroPGF-2](https://www.fil-retropgf.io/). In early January, the rewards for the second round of Filecoin's Retroactive Public Goods Funding program will be distributed through Drips — directly on Filecoin Mainnet.

![The Explore Page on Drips Filecoin](/assets/blog-images/drips-on-filecoin.png)

For us, this marked a huge milestone: deploying our protocol and app on a new chain other than Ethereum for the first time. Behind the scenes, we reworked large parts of our infrastructure to natively support multi-network use cases. Now users can seamlessly switch between different networks on Drips through the new network picker. Going forward, we'll focus on improving the multi-chain experience even further, by aggregating information from multiple chains into a single view.

Huge shout-out to [Ioannis](https://github.com/jtourkos), who worked tirelessly to launch our new [multichain GraphQL API](https://github.com/drips-network/graphql-api), and [Igor](https://github.com/CodeSandwich), who ensured our protocol is ready for easy deployments across many chains.

[Learn more about FIL-RetroPGF-2](https://www.fil-retropgf.io/), and stay tuned for Drips launching on more chains in the future!

# ⛽️ Gasless claiming with Gelato Relay

Initially exclusively on Filecoin, we've also made claiming projects, and collecting of earned funds on Drips entirely gasless. In practice, this means that users won't need to acquire any FIL before they can claim and collect their rewards, greatly enhancing the user experience.

We even added the ability to automatically un-wrap supported native token wrappers like wFIL. This means after claiming and collecting rewards, users will immediately have native FIL in their wallets, which they can use to pay the necessary gas for offramping to an exchange or other DeFi apps.

![Gasless claiming on Drips on Filecoin](/assets/blog-images/gasless-claiming.png)

Behind the scenes, we're using [Gelato Relay](https://www.gelato.network/relay) to _relay_ transactions and pay for their gas on behalf of our users. All the user needs to do is sign an [EIP-712](https://eips.ethereum.org/EIPS/eip-712) message with their wallet, and we'll take care of the rest.

We're planning to offer gasless claiming on other chains soon — stay tuned!

# 🌐 Embeddable support buttons

Many of you have asked us to offer "Support me" buttons for GitHub READMEs. And we've delivered!

Our new embeddable support buttons are customizable, easy to set up, and can be added to any website or README on GitHub. Clicking them leads straight to your project's profile on Drips, where visitors can send one-time or continuous donations. You can choose between a classic GitHub-style badge, or a more prominent Drips-styled button. You can even display the number of dependencies you split to, or the total amount of donations received, and those values will update automatically.

![Support button configurator](/assets/blog-images/support-button-configurator.png)

Shout-out to [Morgan](https://github.com/mhgbrown), who not only implemented the new support button feature, but also completely reworked our Share modal.

Get started with embeddable support buttons by heading over to any project on Drips and clicking the Share button.

# 🙈 Drip List & project visibility controls

Some of you might already know that [Drip Lists](https://docs.drips.network/support-your-dependencies/overview) are actually NFTs on-chain, and can thus be transferred between accounts. This can be pretty useful in many ways; for example when rotating keys, for creating "immutable" Drip Lists by transferring them to the null address, or simply for passing ownership to another person. However, we want to avoid users receiving lists that they don't want to display on their public Drips profile.

With our new [visibility controls](https://docs.drips.network/advanced/drip-list-and-project-visibility), a Drip List that is transferred to a new owner is automatically "hidden" by default, and won't appear on the recipient's public profiles. The list's new owner can then decide whether they want to make it visible again.

The same also applies for projects, which owners can now choose to similarly hide from their profiles. The Drips app also prevents others from sending any funds to hidden lists or projects.

![Example of a hidden project](/assets/blog-images/hidden-project.png)

Thank you [Ioannis](https://github.com/jtourkos) for shipping this feature, which took quite some work across much of our codebase.

Learn more about visibility controls [here](https://docs.drips.network/advanced/drip-list-and-project-visibility).

# What's next?

Right after Devcon, the entire Drips team came together for an off-site — with the main question being: What's next?

Suffice to say, after a long brainstorming session, we've got a lot of exciting new features and improvements planned for 2025. We'll focus on attracting more funding for more open-source projects, growing the depth of the Drips Dependency Tree, and focus on adding some AI-powered features with [Drips AI] [[inc link to twitter thread](https://x.com/dripsnetwork/status/1868664069449793997)]...

We also want to hear from you! What features would you love to see in Drips this quarter? Share your thoughts by [tweeting at us](https://x.com/dripsnetwork) or [joining our Discord](https://discord.gg/BakDKKDpHF).
