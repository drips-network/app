<script lang="ts">
  import type { DripListsSectionDripListFragment } from '../drip-lists-section/__generated__/gql.generated';
  import Section from '../section/section.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import DripListsGrid from '../../../routes/(pages)/app/(app)/components/drip-lists-grid.svelte';

  export let dripLists: DripListsSectionDripListFragment[] = [];
</script>

<Section
  header={{
    icon: DripListIcon,
    label: 'Featured Drip Lists',
  }}
  skeleton={{
    loaded: true,
    empty: !dripLists.length,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No Featured Drip Lists',
    emptyStateText: 'We couldn’t find any featured Drip Lists.',
  }}
>
  <DripListsGrid {dripLists} />
</Section>
