<script lang="ts">
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';
  import type { ComponentProps } from 'svelte';

  export let dripLists: ComponentProps<DripListCard>['data']['dripList'][];
</script>

<div class="drip-list-cards-grid">
  {#each dripLists as dripList}
    <DripListCard listingMode data={{ dripList: dripList }} />
  {/each}
</div>

<style>
  .drip-list-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
    gap: 1rem;
    padding: 4px 2px;
  }

  @media (max-width: 767px) {
    .drip-list-cards-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
