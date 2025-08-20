<script lang="ts">
  import Section from '$lib/components/section/section.svelte';
  import EcosystemsGrid from './ecosystems-grid.svelte';
  import type { EcosystemsListItem } from '$lib/utils/ecosystems/schemas';
  import type { EcosystemCardFragment } from './__generated__/gql.generated';

  export let ecosystems: Array<[EcosystemsListItem, EcosystemCardFragment | undefined]>;

  let error = false;

  export let collapsed = false;
  export let collapsable = false;
</script>

<Section
  bind:collapsed
  bind:collapsable
  skeleton={{
    horizontalScroll: false,
    loaded: true,
    empty: ecosystems.length === 0,
    error,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No ecosystems',
    emptyStateText: 'Create an ecosystem to get started.',
  }}
>
  {#if ecosystems}
    <EcosystemsGrid big {ecosystems} />
  {/if}
</Section>
