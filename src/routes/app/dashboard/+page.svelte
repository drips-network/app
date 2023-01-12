<script lang="ts">
  import Balances from './sections/balances.section.svelte';
  import Streams from './sections/streams.section.svelte';
  import Splits from './sections/splits.section.svelte';

  import wallet from '$lib/stores/wallet';
  import guardConnected from '$lib/utils/guard-connected';

  $: userId = $wallet.dripsUserId;

  $: {
    $wallet.connected;
    guardConnected();
  }
</script>

<svelte:head>
  <title>Dashboard | Drips</title>
  <meta name="description" content="Radicle Drips Dashboard" />
</svelte:head>

<div class="dashboard">
  <h1>Dashboard</h1>
  <Balances {userId} disableActions={false} />
  <Streams {userId} disableActions={false} />
  <Splits {userId} disableActions={false} />
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
</style>
