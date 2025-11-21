<script>
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
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

<HeadMeta
  title="Ecosystem funding"
  description="Drips is the simplest way to fund your ecosystem. Distribute funding across your ecosystem, reward contributors, and power continuous funding flows."
/>

<SolutionHeader>
  {#snippet usecase_badge()}
    Ecosystem funding
  {/snippet}
  {#snippet headline()}
    Build a stronger ecosystem
  {/snippet}
  {#snippet description()}
    Funding shouldn’t stop at the core team. Drips enables protocols and communities to distribute
    funding across their ecosystems - supporting the contributors, infrastructure providers, and
    maintainers that make your project possible.
  {/snippet}
</SolutionHeader>

<SolutionCard>
  {#snippet illustration()}
    <SolutionsEcosystemsDistribution />
  {/snippet}
  {#snippet headline()}
    Reward contributors with continuous funding flows
  {/snippet}
  {#snippet description()}
    Set up programmable revenue-sharing, stream funds over time, and align incentives across your
    ecosystem.
  {/snippet}
  {#snippet line_items()}
    <SolutionLineItem icon={Ecosystem}>
      Fund up to 40,000 recipients predictably and continuously
    </SolutionLineItem>
    <SolutionLineItem icon={User}>Send funds to core and peripheral contributors</SolutionLineItem>
    <SolutionLineItem icon={TokenStreams}>
      Replace one-time grants with recurring funding
    </SolutionLineItem>
  {/snippet}
</SolutionCard>

<SolutionInterstitial>
  {#snippet headline()}
    Strengthen your ecosystem
  {/snippet}
  {#snippet description()}
    Shared funding infrastructure keeps your ecosystem resilient, and keeps contributors motivated
    over the long term.
  {/snippet}
</SolutionInterstitial>

<SolutionCard reverse>
  {#snippet illustration()}
    <SolutionsEcosystemGraph />
  {/snippet}
  {#snippet headline()}
    Power continuous funding across your ecosystem
  {/snippet}
  {#snippet description()}
    Stream in real-time, allocate resources dynamically, and keep every transaction transparent and
    on-chain.
  {/snippet}
  {#snippet line_items()}
    <SolutionLineItem icon={Ecosystem}>
      Distribute ecosystem-wide funding with programmable logic
    </SolutionLineItem>
    <SolutionLineItem icon={User}>
      Recurring income for visible and behind-the-scenes contributors
    </SolutionLineItem>
    <SolutionLineItem icon={TokenStreams}>Avoid manual funding rounds</SolutionLineItem>
  {/snippet}
</SolutionCard>
