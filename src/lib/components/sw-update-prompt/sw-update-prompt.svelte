<script lang="ts">
  import { browser } from '$app/environment';
  import { useRegisterSW } from 'virtual:pwa-register/svelte';
  import Button from '../button/button.svelte';

  const { needRefresh, updateServiceWorker } = (browser && useRegisterSW()) || {};

  export let showingToast = $needRefresh ?? false;
  $: showingToast = $needRefresh ?? false;
</script>

{#if $needRefresh}
  <div class="pwa-toast" role="alert">
    <div class="message">
      <h3 class="pixelated">New version available</h3>
      <span> A new version of Drips is available. Please refresh the page to install. </span>
    </div>
    <Button variant="primary" on:click={() => updateServiceWorker?.(true)}>Refresh Drips</Button>
  </div>
{/if}

<style>
  .pwa-toast {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 16px;
    padding: 12px;
    border-radius: 1rem 0 1rem 1rem;
    z-index: 1;
    text-align: left;
    box-shadow: var(--elevation-medium);
    background-color: white;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    align-items: flex-end;
    max-width: 24rem;
  }

  .pwa-toast .message {
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
