<script>
  import ConnectButton from '$lib/components/connect-button/connect-button.svelte';
  import ens from '$lib/stores/ens';
  import walletStore from '$lib/stores/wallet';
</script>

<h1 class="typo-header-1">Hello new Drips app!</h1>
<ConnectButton />
{#if $walletStore?.connected}
  <p>Current address: {$walletStore.address}</p>
  <p>ENS: {$ens[$walletStore.address]?.name ?? 'None'}</p>
{/if}

<style>
  h1 {
    color: var(--color-primary);
  }
</style>
