<script lang="ts">
  import wallet from '$lib/stores/wallet';
  import { createEventDispatcher, onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import type { Stream } from '$lib/stores/streams/types';
  import streams from '$lib/stores/streams';
  import type { StepComponentEvents, UpdateAwaitStepFn } from '$lib/components/stepper/types';
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import etherscanLink from '$lib/utils/etherscan-link';
  import expect from '$lib/utils/expect';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: Stream;

  async function pause(updateAwaitStep: UpdateAwaitStepFn) {
    const { dripsUserId, address } = $wallet;
    assert(dripsUserId && address);

    const addressDriverClient = await getAddressDriverClient();

    const { tokenAddress } = stream.dripsConfig.amountPerSecond;

    const ownAccount = $streams.accounts[dripsUserId];
    assert(ownAccount, "App hasn't yet fetched user's own account");

    const assetConfig = ownAccount.assetConfigs.find(
      (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
    );
    assert(assetConfig, "App hasn't yet fetched the right asset config");

    const currentReceivers = mapFilterUndefined(assetConfig.streams, (stream) =>
      stream.paused
        ? undefined
        : {
            userId: stream.receiver.userId,
            config: stream.dripsConfig.raw,
          },
    );

    const newReceivers = [
      ...currentReceivers,
      {
        userId: stream.receiver.userId,
        config: stream.dripsConfig.raw,
      },
    ];

    updateAwaitStep({
      icon: {
        component: Emoji,
        props: {
          emoji: '👛',
          size: 'huge',
        },
      },
      message: 'Waiting for you to confirm the un-pause transaction in your wallet...',
    });

    const tx = await addressDriverClient.setDrips(
      tokenAddress,
      currentReceivers,
      newReceivers,
      address,
      0,
    );

    updateAwaitStep({
      message: 'Waiting for your transaction to be confirmed…',
      link: {
        label: 'View on Etherscan',
        url: etherscanLink($wallet.network.name, tx.hash),
      },
    });

    await tx.wait(1);

    updateAwaitStep({
      message: 'Wrapping up…',
    });

    await expect(
      streams.refreshUserAccount,
      () => streams.getStreamById(stream.id)?.paused === false,
      5000,
      1000,
    );
  }

  onMount(() => {
    dispatch('await', {
      promise: (fn) => pause(fn),
      message: 'Preparing to un-pause stream…',
    });
  });
</script>
