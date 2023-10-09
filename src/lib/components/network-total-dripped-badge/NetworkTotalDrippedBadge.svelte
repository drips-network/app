<script lang="ts">
  import Drip from '../illustrations/drip.svelte';
  import mergeAmounts from '$lib/utils/amounts/merge-amounts';
  import balancesStore from '$lib/stores/balances/balances.store';
  import { constants } from 'radicle-drips';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import accountFetchStatusses from '$lib/stores/account-fetch-statusses/account-fetch-statusses.store';

  let dripLists = [
    {
      // Radworks Software Dep.s list
      id: '50330452048867519181028275890986093327647919805766323166158196453514',
      ownerAccountId: '808735843097274646438052281344003835551042056378',
    },
  ];

  // copied logic from drip-list-card.svelte
  // but balances/streams are not loaded
  // i guess bc it's landing page and outside /app setup?

  // (just focusing on dripLists[0] for simplicity)
  $: streamEstimates =
    $balancesStore &&
    balancesStore.getStreamEstimatesByReceiver('total', dripLists[0].id).map((e) => ({
      amount: e.totalStreamed / BigInt(constants.AMT_PER_SEC_MULTIPLIER),
      tokenAddress: e.tokenAddress,
    }));

  /*
    Only the list owner can set support streams to the list, so we can consider the stream estimate to the list loaded when
    the owner account is loaded.
  */
  $: streamEstimateLoaded = $accountFetchStatusses[dripLists[0].ownerAccountId]?.all === 'fetched';

  // (ignore incomingSplitTotal for now)
  let totalIncomingAmounts: ReturnType<typeof mergeAmounts> | undefined = undefined;
  $: totalIncomingAmounts = /*incomingSplitTotal &&*/ streamEstimateLoaded
    ? mergeAmounts(streamEstimates /*, incomingSplitTotal*/)
    : undefined;
</script>

<div class="rounded-drip-lg bg-primary-level-1 flex items-center h-8 px-3 gap-2 text-primary">
  <div class="w-2.5">
    <Drip />
  </div>
  <AggregateFiatEstimate amounts={totalIncomingAmounts} />
  dripped
</div>
