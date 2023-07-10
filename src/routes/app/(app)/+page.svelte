<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import wallet from '$lib/stores/wallet/wallet.store';
  import isSafePath from '$lib/utils/safe-path';

  const backTo = $page.url.searchParams.get('backTo');

  $: {
    if ($wallet.connected) {
      if (backTo) {
        const decoded = decodeURIComponent(backTo);
        const isSafe = isSafePath(decoded);

        if (isSafe) goto(decoded);
      } else {
        goto('/app/streams');
      }
    }
  }
</script>

<HeadMeta title="Drips" />

<LargeEmptyState
  emoji="🌐"
  headline="Connect to Drips"
  description="Connect your wallet to view your Dashboard, or search to find profiles by ENS or address."
/>
