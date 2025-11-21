<script>
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import Github from '$lib/components/icons/Github.svelte';
  import GnosisSafe from '$lib/components/icons/GnosisSafe.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import Transactions from '$lib/components/icons/Transactions.svelte';
  import SolutionsHackathonLeaderboard from '$lib/components/illustrations/solutions-hackathon-leaderboard.svelte';
  import SolutionsHackathonVoting from '$lib/components/illustrations/solutions-hackathon-voting.svelte';
  import SolutionCard from '$lib/components/solutions/solution-card.svelte';
  import SolutionHeader from '$lib/components/solutions/solution-header.svelte';
  import SolutionInterstitial from '$lib/components/solutions/solution-interstitial.svelte';
  import SolutionLineItem from '$lib/components/solutions/solution-line-item.svelte';
</script>

<HeadMeta
  title="Hackathons"
  description="Drips is the simplest way to run hackathons, from voting on winners to distributing prizes. Simplify your hackathon logistics and reward contributions transparently."
/>

<SolutionHeader>
  {#snippet usecase_badge()}
    Hackathons
  {/snippet}
  {#snippet headline()}
    Simplify voting & reward payouts
  {/snippet}
  {#snippet description()}
    Hackathon voting, choosing winners, and distributing prizes can quickly turn into a tangle of
    spreadsheets, DMs, and manual transactions. With Drips, you can simplify all of that and spend
    less time on the logistics.
  {/snippet}
</SolutionHeader>

<SolutionCard>
  {#snippet illustration()}
    <SolutionsHackathonVoting />
  {/snippet}
  {#snippet headline()}
    Run votes and payouts in one seamless flow
  {/snippet}
  {#snippet description()}
    Vote on winners, distribute prizes automatically, and keep everything transparent and on-chain.
  {/snippet}

  {#snippet line_items()}
    <SolutionLineItem icon={Proposals}>
      Let participants or judges vote on the best projects
    </SolutionLineItem>
    <SolutionLineItem icon={Github}>
      Send funds directly to winners’ GitHub repositories
    </SolutionLineItem>
    <SolutionLineItem icon={Transactions}>
      Automatically distribute funds to all winners in a single transaction
    </SolutionLineItem>
  {/snippet}
</SolutionCard>

<SolutionInterstitial>
  {#snippet headline()}
    Get started with your own hackathon
  {/snippet}
  {#snippet description()}
    Drips is already helping communities and ecosystems run lighter, faster funding rounds without
    the usual hassle. Whether you’re hosting a small weekend sprint or a global event, it’s a simple
    way to reward contributions with less admin.
  {/snippet}
</SolutionInterstitial>

<SolutionCard reverse>
  {#snippet illustration()}
    <SolutionsHackathonLeaderboard />
  {/snippet}
  {#snippet headline()}
    Everything you need to get your hackathon started
  {/snippet}
  {#snippet description()}
    Automate prize distribution, scale funding easily, and keep every payout transparent.
  {/snippet}
  {#snippet line_items()}
    <SolutionLineItem icon={Proposals}>
      Run a distributed off-chain vote with any number of Ethereum addresses
    </SolutionLineItem>
    <SolutionLineItem icon={DripList}>
      Publish voting results on-chain as a Drip List
    </SolutionLineItem>
    <SolutionLineItem icon={GnosisSafe}>
      Fund hackathon winners using any ERC-20 from an EOA or Safe Multisig
    </SolutionLineItem>
  {/snippet}
</SolutionCard>
