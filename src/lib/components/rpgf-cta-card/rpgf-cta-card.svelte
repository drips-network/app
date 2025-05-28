<script lang="ts">
  import type { WrappedRoundAdmin, WrappedRoundPublic } from '$lib/utils/rpgf/schemas';
  import Button from '../button/button.svelte';
  import Ledger from '../icons/Ledger.svelte';

  export let round: WrappedRoundPublic['round'] | WrappedRoundAdmin['round'];
  $: state = round.state;
</script>

{#if state !== 'pending-intake'}
  <div class="card">
    {#if state === 'intake'}
      <h2 class="pixelated">Apply to this round</h2>
      <p class="typo-text">This round is currently accepting applications.</p>
      <Button
        href="/app/rpgf/rounds/{round.urlSlug}/applications/new"
        icon={Ledger}
        variant="primary"
        size="large"
      >
        Apply
      </Button>
    {/if}
  </div>
{/if}

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
  }
</style>
