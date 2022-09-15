<script>
  import ConnectButton from '$lib/components/connect-button/connect-button.svelte';
  import walletStore from '$lib/stores/wallet';
</script>

<h1 class="typo-header-1">Hello new Drips app!</h1>
<ConnectButton />
{#if $walletStore?.connected}
  Current address: {$walletStore?.address}
{/if}

<style>
  h1 {
    color: var(--color-primary);
  }
</style>
