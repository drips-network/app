<script lang="ts">
  import Button from 'radicle-design-system/Button.svelte';
  import walletStore from '$lib/stores/wallet';
</script>

{#if $walletStore?.connected}
  <Button on:click={() => walletStore.disconnect()}>Disconnect wallet</Button>
{:else}
  <Button on:click={() => walletStore.connect()}>Connect wallet</Button>
{/if}
