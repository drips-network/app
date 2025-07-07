<script lang="ts">
  import Button from '../button/button.svelte';
  import EmptyState from '../section-skeleton/empty-state.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';

  export let emoji: string | undefined = undefined;
  export let headline: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let button: { label: string; handler: () => void } | undefined = undefined;
</script>

<div class="dynamic-empty-state">
  <EmptyState {emoji} {headline} text={description} />
  <div class="buttons">
    {#if button}<Button icon={Wallet} variant="primary" on:click={button.handler}
        >{button.label}</Button
      >{/if}
  </div>
</div>

<style>
  .dynamic-empty-state {
    height: 100%;
    padding: 25vh 0;
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-direction: column;
    align-items: center;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
  }
</style>
