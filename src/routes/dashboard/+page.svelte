<script lang="ts">
  import Balances from './sections/balances.section.svelte';
  import Streams from './sections/streams.section.svelte';
  import Splits from './sections/splits.section.svelte';

  import { goto } from '$app/navigation';
  import wallet from '$lib/stores/wallet';

  $: {
    if (!$wallet.connected) {
      goto('/');
    }
  }
</script>

<svelte:head>
  <title>Drips — Dashboard</title>
  <meta name="description" value="Radicle Drips Dashboard" />
</svelte:head>

<div class="dashboard">
  <h1>Dashboard</h1>
  <Balances />
  <Streams />
  <Splits />
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
</style>
