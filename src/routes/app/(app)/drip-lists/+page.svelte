<script lang="ts">
  import walletStore from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import DripListsSection from '$lib/components/drip-lists-section/drip-lists-section.svelte';

  const walletInitialized = walletStore.initialized;
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';

  $: {
    $walletStore.connected;
    $walletInitialized;

    guardConnected();
  }
</script>

<HeadMeta title="Drip List" />

<DripListsSection address={$walletStore.address} />
