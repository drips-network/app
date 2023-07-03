<script lang="ts">
  import walletStore from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import DripListsSection from '$lib/components/drip-lists-section/drip-lists-section.svelte';

  $: {
    $walletStore.connected;
    guardConnected();
  }
</script>

<svelte:head>
  <title>Drip Lists | Drips</title>
  <meta name="description" content="Drip Lists Page" />
</svelte:head>

{#if $walletStore.address}
  <DripListsSection address={$walletStore.address} />
{/if}
