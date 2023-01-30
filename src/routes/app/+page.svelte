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
  <title>Drips • Crowdfunding for the Open Web</title>
  <meta
    name="description"
    content="Drips is a Web3 toolkit that enables developers to raise and manage funds by the second, without any platform fees."
  />
</svelte:head>

<LargeEmptyState
  emoji="🌐"
  headline="Connect to Drips"
  description="Connect your wallet to view your Dashboard, or search to find profiles by ENS or address."
/>
