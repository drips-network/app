<script>
  import DripList from '$lib/components/icons/DripList.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import SolutionsDependencyTree from '$lib/components/illustrations/solutions-dependency-tree.svelte';
  import SolutionsRecurringFunding from '$lib/components/illustrations/solutions-recurring-funding.svelte';
  import SolutionCard from '$lib/components/solutions/solution-card.svelte';
  import SolutionHeader from '$lib/components/solutions/solution-header.svelte';
  import SolutionLineItem from '$lib/components/solutions/solution-line-item.svelte';
</script>

<SolutionHeader>
  <svelte:fragment slot="headline">Sustain your dependencies, sustain your project</svelte:fragment>
  <svelte:fragment slot="description">
    Open-source software is the backbone of most projects but many of the libraries and tools we
    rely on are critically underfunded. With Drips, you can automate funding for the software you
    rely on, ensuring that maintainers get rewarded for their valuable work and projects remain
    stable.
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
    Allocate revenue, stream funds, and secure your stack
  </svelte:fragment>
  <svelte:fragment slot="line-items">
    <SolutionLineItem icon={TokenStreams}>
      Support maintainers and dependencies through recurring funding
    </SolutionLineItem>
    <SolutionLineItem icon={DripList}>
      Make Drip Lists with custom splits and no manual overhead
    </SolutionLineItem>
    <SolutionLineItem icon={Ledger}>
      Fund your dependencies with predictable, recurring funding
    </SolutionLineItem>
  </svelte:fragment>
</SolutionCard>

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
