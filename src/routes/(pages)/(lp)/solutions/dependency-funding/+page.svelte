<script>
  import Coin from '$lib/components/icons/Coin.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import SolutionsDependencyTree from '$lib/components/illustrations/solutions-dependency-tree.svelte';
  import SolutionsRecurringFunding from '$lib/components/illustrations/solutions-recurring-funding.svelte';
  import SolutionCard from '$lib/components/solutions/solution-card.svelte';
  import SolutionHeader from '$lib/components/solutions/solution-header.svelte';
  import SolutionInterstitial from '$lib/components/solutions/solution-interstitial.svelte';
  import SolutionLineItem from '$lib/components/solutions/solution-line-item.svelte';
</script>

<SolutionHeader>
  <svelte:fragment slot="usecase-badge">Dependency Funding</svelte:fragment>
  <svelte:fragment slot="headline">Sustain your dependencies, sustain your project</svelte:fragment>
  <svelte:fragment slot="description">
    Open-source software is the backbone of the digital world, but many projects we rely on are
    critically underfunded. With Drips, you can automate funding for the software you rely on,
    ensuring that it remains stable and secure.
  </svelte:fragment>
</SolutionHeader>

<SolutionCard>
  <svelte:fragment slot="illustration">
    <SolutionsRecurringFunding />
  </svelte:fragment>
  <svelte:fragment slot="headline">
    Support open-source maintainers with predictable, recurring funding
  </svelte:fragment>
  <svelte:fragment slot="description">
    Drips makes it easy to fund open-source projects with predictable, recurring funding.
  </svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={Coin}>
      Stream and split any ERC-20 token directly to any open-source GitHub repo - no ETH addresses
      required
    </SolutionLineItem>
    <SolutionLineItem icon={DripList}>
      Create a Drip List to fund all your dependencies in one go
    </SolutionLineItem>
    <SolutionLineItem icon={TokenStreams}>
      Make one-time donations, or fund continuously with a flexible stream
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>

<SolutionInterstitial>
  <svelte:fragment slot="headline">Start funding your dependencies today</svelte:fragment>
  <svelte:fragment slot="description">
    Talk to us so we can design your bespoke Dependency Funding program together.
  </svelte:fragment>
</SolutionInterstitial>

<SolutionCard reverse>
  <svelte:fragment slot="illustration">
    <SolutionsDependencyTree />
  </svelte:fragment>
  <svelte:fragment slot="headline">Funding flows down the dependency tree</svelte:fragment>
  <svelte:fragment slot="description">
    On Drips, funds sent to projects are further split to that project's dependencies, and so on.
  </svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={DripList}>
      Worry only about your own dependencies, but still fund your entire dependency tree
    </SolutionLineItem>
    <SolutionLineItem icon={DripList}>
      Push funding down the stack, not just to the top
    </SolutionLineItem>
    <SolutionLineItem icon={Ledger}>
      Funds automatically redirect as the dependency tree changes
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>
