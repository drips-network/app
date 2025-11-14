<script lang="ts">
  import RpgfRoundCard from '$lib/components/rpgf-round-card/rpgf-round-card.svelte';
  import type { Round } from '$lib/utils/rpgf/types/round';

  interface Props {
    rounds: Round[];
  }

  let { rounds }: Props = $props();
</script>

<div class="drip-list-cards-grid">
  {#if rounds.length === 0}
    <p class="text-center text-muted">No Drip Lists found.</p>
  {/if}
  {#each rounds as round}
    <RpgfRoundCard {round} />
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
