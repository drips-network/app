<script lang="ts">
  import { run } from 'svelte/legacy';

  import wallet from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Streams from './sections/streams.section.svelte';
  import type { PageData } from './$types';
  import Balances from './sections/balances.section.svelte';
  import unreachable from '$lib/utils/unreachable';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let accountId = $derived($wallet.dripsAccountId);

  const walletInitialized = wallet.initialized;

  run(() => {
    $wallet.connected;
    $walletInitialized;

    guardConnected();
  });
</script>

<HeadMeta title="Funds" />

<div class="dashboard">
  <div class="sections">
    <Balances {accountId} userBalances={data.balances ?? unreachable()} disableActions={false} />
    <Streams {accountId} userStreams={data.streams ?? unreachable()} disableActions={false} />
  </div>
</div>

<style>
  .sections {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
</style>
