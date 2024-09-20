---
title: 'Introducing Collaborative Drip Lists'
date: '2024-09-19'
coverImage: '/assets/blog-images/collaborative-drip-lists.png'
coverImageAlt: 'Collaborative Drip List illustration'
excerpt: 'We’re excited to introduce a powerful new feature to streamline and simplify the way communities manage funding and voting initiatives: Collaborative Drip Lists.'
---

<script>
  import BlogVideoPlayer from "$lib/components/blog/article-layout/components/blog-video-player.svelte";
  import BlogDripListCard from "$lib/components/blog/article-layout/components/blog-drip-list-card.svelte";
</script>

Have you ever wanted your community to vote on which FOSS projects should receive funding, a public goods funding initiative like a [RetroPGF round](https://medium.com/ethereum-optimism/retroactive-public-goods-funding-33c9b7d00f0c) or decide the winners of a hackathon? Until now, managing those initiatives has been a cumbersome, admin-heavy ordeal, involving lots of manual work and juggling different tools for voting, allocation, and distribution. In the best-case scenario, the user experience is clunky. In the worst case, the process can stall, or funds can get lost.

Enter [Collaborative Drip Lists](https://docs.drips.network/support-your-dependencies/collaborative-drip-lists/creating-a-collaborative-drip-list). Designed to streamline collective decision-making, collaborative lists allow participants to collaborate and vote on which projects should receive funding, simplifying the entire process. Everything from voting to distribution is managed in one place, reducing administrative tasks and the hassle of using multiple tools. With a seamless user experience and full end-to-end management, communities can now run funding rounds or voting initiatives with improved transparency and efficiency.

# How It Works: Simple, Flexible, and Customizable

Collaborative Drip Lists function just like regular Drip Lists, except instead of one person curating the list, the projects that get funded and the amounts of funding are chosen collaboratively through voting.

![Creation dialog for a collaborative Drip List](/assets/blog-images/collaborative-drip-lists-creation.png)

The process starts by creating a Drip List, which you can customize to fit your needs: after choosing “Collaborate”, you can then decide whether voting should be public or private, depending on the desired level of transparency. By default, collaborators can vote for any Ethereum address, GitHub repository, or other Drip List to receive a percentage of funds, but you can also choose to restrict the vote to certain recipients upfront.

Lastly, choose when voting should end, and kick off the vote. Each collaborator gets one vote, which they can split between multiple recipients, deciding on the percentage of funds they think each should receive.

After voting concludes, you publish the list on-chain, where it can be funded by anyone.

<BlogVideoPlayer src="https://www.youtube-nocookie.com/embed/wyP3F8oOGL4?si=j2alHI-VF7XQWl3b" />

# Case Study: Scroll Level Up Hackathon

In August, [Scroll used Collaborative Drip Lists](https://www.drips.network/blog/posts/scroll-argentinia-hackathon) to power a community vote for the winners of their [“Level Up” Hackathon](https://x.com/Scroll_ES/status/1818404010447286774) in Argentina.

Over 2500 community members were invited to vote and determine the winners of the hackathon together. Managing votes in such a large hackathon would usually have required hours of manual coordination, but thanks to the streamlined process of Collaborative Drip Lists, Scroll was able to collect the votes effortlessly and distribute over $20,000 USDC to [the hackathon winners](https://www.drips.network/app/drip-lists/41971962915943119138973997144514496143454239023249281594792952267407) with complete transparency.

<BlogDripListCard dripListId="41971962915943119138973997144514496143454239023249281594792952267407" />

# What’s now possible with Collaborative Drip Lists?

The Level Up Hackathon is a great example of how Collaborative Drip Lists can enable community voting in hackathons. But their potential goes far beyond that.

With their flexibility and scalability, collaborative lists can also power full-scale RetroPGF-style public goods funding rounds within your ecosystem. Simply create the list, invite your RPGF badge-holders as collaborators, and you’re ready to go. You’ll get all the impact of a RetroPGF round, but with an integrated, end-to-end UX for both allocation and distribution.

While hackathons and RetroPGF rounds are obvious use cases, we believe that they’re just the beginning. Collaborative Drip Lists are versatile enough to support any community-driven initiative that involves decision-making or resource allocation. Whether you want to fund new projects, reward contributors, or run large-scale community votes, collaborative lists give you the control and transparency you need to make it happen.

Want to explore how Collaborative Drip Lists can help you achieve your PGF goals? Drop a message on our [Discord](https://discord.com/invite/BakDKKDpHF).
