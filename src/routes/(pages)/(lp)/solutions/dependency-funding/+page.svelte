<script>
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
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

<HeadMeta
  title="Dependency Funding"
  description="Drips is the simplest way to fund your dependencies. Sustain your open-source dependencies with predictable, recurring funding."
/>

<SolutionHeader>
  {#snippet usecase_badge()}
    Dependency Funding
  {/snippet}
  {#snippet headline()}
    Sustain your dependencies, sustain your project
  {/snippet}
  {#snippet description()}
    Open-source software is the backbone of the digital world, but many projects we rely on are
    critically underfunded. With Drips, you can automate funding for the software you rely on,
    ensuring that it remains stable and secure.
  {/snippet}
</SolutionHeader>

<SolutionCard>
  {#snippet illustration()}
    <SolutionsRecurringFunding />
  {/snippet}
  {#snippet headline()}
    Support open-source maintainers with predictable, recurring funding
  {/snippet}
  {#snippet description()}
    Drips makes it easy to fund open-source projects with predictable, recurring funding.
  {/snippet}
  {#snippet line_items()}
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
  {/snippet}
</SolutionCard>

<SolutionInterstitial>
  {#snippet headline()}
    Start funding your dependencies today
  {/snippet}
  {#snippet description()}
    Talk to us so we can design your bespoke Dependency Funding program together.
  {/snippet}
</SolutionInterstitial>

<SolutionCard reverse>
  {#snippet illustration()}
    <SolutionsDependencyTree />
  {/snippet}
  {#snippet headline()}
    Funding flows down the dependency tree
  {/snippet}
  {#snippet description()}
    On Drips, funds sent to projects are further split to that project's dependencies, and so on.
  {/snippet}
  {#snippet line_items()}
    <SolutionLineItem icon={DripList}>
      Worry only about your own dependencies, but still fund your entire dependency tree
    </SolutionLineItem>
    <SolutionLineItem icon={DripList}>
      Push funding down the stack, not just to the top
    </SolutionLineItem>
    <SolutionLineItem icon={Ledger}>
      Funds automatically redirect as the dependency tree changes
    </SolutionLineItem>
  {/snippet}
</SolutionCard>
