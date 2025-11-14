<script lang="ts">
  import Section from '$lib/components/section/section.svelte';
  import EcosystemsGrid from './ecosystems-grid.svelte';
  import type { EcosystemsListItem } from '$lib/utils/ecosystems/schemas';
  import type { EcosystemCardFragment } from './__generated__/gql.generated';


  let error = false;

  interface Props {
    ecosystems: Array<[EcosystemsListItem, EcosystemCardFragment | undefined]>;
    collapsed?: boolean;
    collapsable?: boolean;
  }

  let { ecosystems, collapsed = $bindable(false), collapsable = $bindable(false) }: Props = $props();
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
