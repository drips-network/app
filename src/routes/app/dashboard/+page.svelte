<script lang="ts">
  import Balances from './sections/balances.section.svelte';
  import Streams from './sections/streams.section.svelte';
  import Splits from './sections/splits.section.svelte';

  import wallet from '$lib/stores/wallet';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import guardConnected from '$lib/utils/guard-connected';

  let userId: string;

  async function getMyUserId() {
    userId = (await (await getAddressDriverClient()).getUserId()).toString();
  }

  getMyUserId();

  $: {
    $wallet.address, getMyUserId();
  }

  $: {
    $wallet.connected;
    guardConnected();
  }
</script>

<svelte:head>
  <title>Drips — Dashboard</title>
  <meta name="description" value="Radicle Drips Dashboard" />
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
