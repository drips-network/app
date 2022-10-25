<script lang="ts">
  import Balances from './sections/balances.section.svelte';
  import Streams from './sections/streams.section.svelte';
  import Splits from './sections/splits.section.svelte';

  import { goto } from '$app/navigation';
  import wallet from '$lib/stores/wallet';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';

  let userId: string;

  let loading = getMyUserId();

  async function getMyUserId() {
    userId = (await (await getAddressDriverClient()).getUserId()).toString();
  }

  $: {
    if (!$wallet.connected) {
      goto('/');
    }
  }

  $: {
    $wallet.address, getMyUserId();
  }
</script>

<svelte:head>
  <title>Drips — Dashboard</title>
  <meta name="description" value="Radicle Drips Dashboard" />
</svelte:head>

<div class="dashboard">
  <h1>Dashboard</h1>
  {#await loading}
    loading...
  {:then}
    <Balances />
    <Streams />
    <Splits {userId} />
  {/await}
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
</style>
