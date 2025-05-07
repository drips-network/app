<script>
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import SolutionsStreamlineRpgf from '$lib/components/illustrations/solutions-streamline-rpgf.svelte';
  import SolutionsVoting from '$lib/components/illustrations/solutions-voting.svelte';
  import SolutionCard from '$lib/components/solutions/solution-card.svelte';
  import SolutionHeader from '$lib/components/solutions/solution-header.svelte';
  import SolutionInterstitial from '$lib/components/solutions/solution-interstitial.svelte';
  import SolutionLineItem from '$lib/components/solutions/solution-line-item.svelte';
</script>

<SolutionHeader>
  <svelte:fragment slot="usecase-badge">RetroPGF Voting & Distribution</svelte:fragment>
  <svelte:fragment slot="headline">Recognize and reward impact easily</svelte:fragment>
  <svelte:fragment slot="description">
    Retroactive public goods funding is a great tool for rewarding impact, however it can be onerous
    in terms of admin. Drips makes it easy to distribute RetroPGF funds efficiently, without lots of
    manual overhead so you can focus on recognizing impact.
  </svelte:fragment>
</SolutionHeader>

<SolutionCard>
  <svelte:fragment slot="illustration">
    <SolutionsVoting />
  </svelte:fragment>
  <svelte:fragment slot="headline">Make funding a community-driven process</svelte:fragment>
  <svelte:fragment slot="description">
    Use Drips to vote on splits, distribute funds directly, and stream rewards with full
    transparency.
  </svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={Proposals}>
      Calculate funding percentages automatically based on votes
    </SolutionLineItem>
    <SolutionLineItem icon={DripList}>
      Distribute funds directly to recipients without manual transfers
    </SolutionLineItem>
    <SolutionLineItem icon={TokenStreams}>
      Stream rewards gradually and record everything on-chain
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>

<SolutionInterstitial>
  <svelte:fragment slot="headline">Make RetroPGF funding fair and efficient</svelte:fragment>
  <svelte:fragment slot="description">
    Retroactive public goods funding is a great tool for rewarding impact. Make it easier and more
    efficient so you can focus on recognizing impact.
  </svelte:fragment>
</SolutionInterstitial>

<SolutionCard reverse>
  <svelte:fragment slot="illustration">
    <SolutionsStreamlineRpgf />
  </svelte:fragment>
  <svelte:fragment slot="headline">Streamline RetroPGF from vote to payout</svelte:fragment>
  <svelte:fragment slot="description">
    Allocate funds transparently, avoid manual work, and distribute rewards over time.
  </svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={CheckCircle}>
      No need for spreadsheets or excessive manual work
    </SolutionLineItem>
    <SolutionLineItem icon={DripList}>On-chain records for every action on Drips</SolutionLineItem>
    <SolutionLineItem icon={TokenStreams}>
      Send funds over time, rather than in lump sums
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>
