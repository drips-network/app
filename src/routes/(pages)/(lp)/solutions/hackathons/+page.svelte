<script>
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

<SolutionHeader>
  <svelte:fragment slot="usecase-badge">Hackathons</svelte:fragment>
  <svelte:fragment slot="headline">Simplify voting & reward payouts</svelte:fragment>
  <svelte:fragment slot="description">
    Hackathon voting, choosing winners, and distributing prizes can quickly turn into a tangle of
    spreadsheets, DMs, and manual transactions. With Drips, you can simplify all of that and spend
    less time on the logistics.
  </svelte:fragment>
</SolutionHeader>

<SolutionCard>
  <svelte:fragment slot="illustration">
    <SolutionsHackathonVoting />
  </svelte:fragment>
  <svelte:fragment slot="headline">Run votes and payouts in one seamless flow</svelte:fragment>
  <svelte:fragment slot="description">
    Vote on winners, distribute prizes automatically, and keep everything transparent and on-chain.
  </svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={Proposals}>
      Let participants or judges vote on the best projects
    </SolutionLineItem>
    <SolutionLineItem icon={Github}>
      Send funds directly to winners’ GitHub repositories
    </SolutionLineItem>
    <SolutionLineItem icon={Transactions}>
      Automatically distribute funds to all winners in a single transaction
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>

<SolutionInterstitial>
  <svelte:fragment slot="headline">Get started with your own hackathon</svelte:fragment>
  <svelte:fragment slot="description">
    Drips is already helping communities and ecosystems run lighter, faster funding rounds without
    the usual hassle. Whether you’re hosting a small weekend sprint or a global event, it’s a simple
    way to reward contributions with less admin.
  </svelte:fragment>
</SolutionInterstitial>

<SolutionCard reverse>
  <svelte:fragment slot="illustration">
    <SolutionsHackathonLeaderboard />
  </svelte:fragment>
  <svelte:fragment slot="headline"
    >Everything you need to get your hackathon started</svelte:fragment
  >
  <svelte:fragment slot="description">
    Automate prize distribution, scale funding easily, and keep every payout transparent.
  </svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={Proposals}>
      Run a distributed off-chain vote with any number of Ethereum addresses
    </SolutionLineItem>
    <SolutionLineItem icon={DripList}>
      Publish voting results on-chain as a Drip List
    </SolutionLineItem>
    <SolutionLineItem icon={GnosisSafe}>
      Fund hackathon winners using any ERC-20 from an EOA or Safe Multisig
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>
