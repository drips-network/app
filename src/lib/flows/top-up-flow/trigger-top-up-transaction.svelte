<script lang="ts">
  import type { StepComponentEvents, UpdateAwaitStepFn } from '$lib/components/stepper/types';
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
  import Emoji from '$lib/components/emoji/Emoji.svelte';
  import etherscanLink from '$lib/utils/etherscan-link';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  async function topUp(updateAwaitStep: UpdateAwaitStepFn) {
    modal.setHideable(false);

    const client = await getAddressDriverClient();

    const { tokenAddress, amountToTopUp } = $context;
    const { address, provider } = $wallet;

    assert(address, 'User is not connected to wallet');
    assert(
      tokenAddress && amountToTopUp,
      'TriggerTopUpTransaction step is missing required context',
    );

    const ownUserId = (await client.getUserId()).toString();
    const ownAccount = $streams.accounts[ownUserId];
    const assetConfig = ownAccount.assetConfigs.find((ac) => ac.tokenAddress === tokenAddress);

    const currentReceivers = mapFilterUndefined(assetConfig?.streams || [], (stream) =>
      stream.paused
        ? undefined
        : {
            userId: stream.receiver.userId,
            config: stream.dripsConfig.raw,
          },
    );

    updateAwaitStep({
      icon: {
        component: Emoji,
        props: {
          emoji: '👛',
          size: 'huge',
        },
      },
      message: 'Waiting for you to confirm the top-up transaction in your wallet',
    });

    const tx = await client.setDrips(
      tokenAddress,
      currentReceivers,
      currentReceivers,
      address,
      amountToTopUp,
    );

    updateAwaitStep({
      message: 'Waiting for your top-up transaction to be confirmed…',
      link: {
        label: 'View on Etherscan',
        url: etherscanLink($wallet.network.name, tx.hash),
      },
    });

    const receipt = await tx.wait();

    updateAwaitStep({
      message: 'Wrapping up…',
    });

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
      message: 'Preparing to top up…',
    });
  });
</script>
