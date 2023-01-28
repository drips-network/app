<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import wallet from '$lib/stores/wallet';
  import isSafePath from '$lib/utils/safe-path';

  const backTo = $page.url.searchParams.get('backTo');

  $: {
    if ($wallet.connected) {
      if (backTo) {
        const decoded = decodeURIComponent(backTo);
        const isSafe = isSafePath(decoded);

        if (isSafe) goto(decoded);
      } else {
        goto('/app/dashboard');
      }
    }
  }
</script>

<svelte:head>
  <title>Drips • Stream and Split Funds on Ethereum</title>
  <meta
    name="description"
    content="An Ethereum protocol for streaming and splitting funds, built by Radicle."
  />
</svelte:head>

<LargeEmptyState
  emoji="🌐"
  headline="Connect to Drips"
  description="Connect your wallet to view your Dashboard, or search to find profiles by ENS or address."
/>
