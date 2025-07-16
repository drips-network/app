<script lang="ts">
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';
  import type { ComponentProps } from 'svelte';

  export let dripLists: ComponentProps<DripListCard>['data']['dripList'][];
  export let cardVariant: ComponentProps<DripListCard>['variant'] = 'partial';
</script>

<div class="drip-list-cards-grid" class:minimal-grid={cardVariant === 'minimal'}>
  {#if dripLists.length === 0}
    <p class="text-center text-muted">No Drip Lists found.</p>
  {/if}
  {#each dripLists as dripList}
    <DripListCard variant={cardVariant} data={{ dripList: dripList }} />
  {/each}
</div>

<style>
  .drip-list-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
    gap: 1rem;
    padding: 4px 2px;
  }

  .drip-list-cards-grid.minimal-grid {
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  }

  @media (max-width: 767px) {
    .drip-list-cards-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
