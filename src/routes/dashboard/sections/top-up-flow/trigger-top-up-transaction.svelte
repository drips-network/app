<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import { onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import type { TopUpFlowState } from './top-up-flow-state';
  import assert from '$lib/utils/assert';
  import wallet from '$lib/stores/wallet';
  import streams from '$lib/stores/streams';
  import modal from '$lib/stores/modal';
  import expect from '$lib/utils/expect';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  async function topUp() {
    modal.setHideable(false);

    const { tokenAddress, amountToTopUp } = $context;
    const { address, provider } = $wallet;

    assert(address, 'User is not connected to wallet');
    assert(
      tokenAddress && amountToTopUp,
      'TriggerTopUpTransaction step is missing required context',
    );

    const tx = await (
      await getAddressDriverClient()
    ).setDrips(tokenAddress, [], [], address, amountToTopUp);

    const receipt = await tx.wait();
    const block = await provider.getBlock(receipt.blockNumber);
    const { timestamp: blockTimestamp } = block;

    /*
    We wait up to five seconds for `refreshUserAccount` to include a history item
    matching our transaction's block timestamp, checking once a second. If it doesn't
    after five tries, we move forward anyway, but the user will be made aware that they
    may need to wait for a while for their dashboard to refresh.
    */
    await expect(
      streams.refreshUserAccount,
      (account) =>
        Boolean(
          account.assetConfigs
            .find((ac) => ac.tokenAddress === tokenAddress)
            ?.history?.find((hi) => hi.timestamp.getTime() / 1000 === blockTimestamp),
        ),
      5000,
      1000,
    );

    modal.setHideable(true);
  }

  onMount(() => {
    dispatch('await', {
      promise: topUp,
      message: 'Waiting for your transaction to be confirmed…',
    });
  });
</script>
