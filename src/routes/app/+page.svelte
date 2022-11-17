<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import wallet from '$lib/stores/wallet';

  const backTo = $page.url.searchParams.get('backTo');

  $: {
    if ($wallet.connected) goto(backTo ? decodeURIComponent(backTo) : '/app/dashboard');
  }
</script>

<svelte:head>
  <title>Radicle Drips - Welcome</title>
  <meta name="description" value="Radicle Drips" />
</svelte:head>

<LargeEmptyState
  emoji="🌐"
  headline="Connect to Drips"
  description="Connect your wallet to view your Dashboard, or search to find profiles by ENS or address."
/>
