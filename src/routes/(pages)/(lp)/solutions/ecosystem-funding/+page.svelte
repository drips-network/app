<script>
  import Ecosystem from '$lib/components/icons/Ecosystem.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import User from '$lib/components/icons/User.svelte';
  import SolutionsEcosystemGraph from '$lib/components/illustrations/solutions-ecosystem-graph.svelte';
  import SolutionsEcosystemsDistribution from '$lib/components/illustrations/solutions-ecosystems-distribution.svelte';
  import SolutionCard from '$lib/components/solutions/solution-card.svelte';
  import SolutionHeader from '$lib/components/solutions/solution-header.svelte';
  import SolutionInterstitial from '$lib/components/solutions/solution-interstitial.svelte';
  import SolutionLineItem from '$lib/components/solutions/solution-line-item.svelte';
</script>

<SolutionHeader>
  <svelte:fragment slot="usecase-badge">Ecosystem funding</svelte:fragment>
  <svelte:fragment slot="headline">Build a stronger ecosystem</svelte:fragment>
  <svelte:fragment slot="description">
    Funding shouldn’t stop at the core team. Drips enables protocols and communities to distribute
    funding across their ecosystems - supporting the contributors, infrastructure providers, and
    maintainers that make your project possible.
  </svelte:fragment>
</SolutionHeader>

<SolutionCard>
  <svelte:fragment slot="illustration">
    <SolutionsEcosystemsDistribution />
  </svelte:fragment>
  <svelte:fragment slot="headline">
    Reward contributors with continuous funding flows
  </svelte:fragment>
  <svelte:fragment slot="description">
    Set up programmable revenue-sharing, stream funds over time, and align incentives across your
    ecosystem.
  </svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={Ecosystem}>
      Fund up to 40,000 recipients predictably and continuously
    </SolutionLineItem>
    <SolutionLineItem icon={User}>Send funds to core and peripheral contributors</SolutionLineItem>
    <SolutionLineItem icon={TokenStreams}>
      Replace one-time grants with recurring funding
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>

<SolutionInterstitial>
  <svelte:fragment slot="headline">Strengthen your ecosystem</svelte:fragment>
  <svelte:fragment slot="description">
    Shared funding infrastructure keeps your ecosystem resilient, and keeps contributors motivated
    over the long term.
  </svelte:fragment>
</SolutionInterstitial>

<SolutionCard reverse>
  <svelte:fragment slot="illustration">
    <SolutionsEcosystemGraph />
  </svelte:fragment>
  <svelte:fragment slot="headline">Power continuous funding across your ecosystem</svelte:fragment>
  <svelte:fragment slot="description">
    Stream in real-time, allocate resources dynamically, and keep every transaction transparent and
    on-chain.
  </svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={Ecosystem}>
      Distribute ecosystem-wide funding with programmable logic
    </SolutionLineItem>
    <SolutionLineItem icon={User}>
      Recurring income for visible and behind-the-scenes contributors
    </SolutionLineItem>
    <SolutionLineItem icon={TokenStreams}>Avoid manual funding rounds</SolutionLineItem>
  </svelte:fragment>
</SolutionCard>
