<script lang="ts">
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { fade, fly } from 'svelte/transition';

  const { initialized } = walletStore;
</script>

{#if $initialized}
  <div in:fade|local={{ duration: 300, delay: 300 }}>
    <slot />
  </div>
{:else}
  <div class="loading-state" out:fly|local={{ duration: 300, y: -16 }}>
    <Spinner />
  </div>
{/if}

<style>
  .loading-state {
    display: fixed;
    height: 100vh;
    width: 100vw;
    background-color: var(--color-background);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
