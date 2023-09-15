<script lang="ts">
  import wallet from '$lib/stores/wallet/wallet.store';
  import { createEventDispatcher, onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import type { Stream } from '$lib/stores/streams/types';
  import streams from '$lib/stores/streams';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import expect from '$lib/utils/expect';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: Stream;

  onMount(() => {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const { dripsAccountId, address } = $wallet;
          assert(dripsAccountId && address);

          const addressDriverClient = await getAddressDriverClient();

          const { tokenAddress } = stream.streamConfig.amountPerSecond;

          const ownAccount = $streams.accounts[dripsAccountId];
          assert(ownAccount, "App hasnʼt yet fetched user's own account");

          const assetConfig = ownAccount.assetConfigs.find(
            (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
          );
          assert(assetConfig, 'App hasnʼt yet fetched the right asset config');

          const currentReceivers = mapFilterUndefined(assetConfig.streams, (stream) =>
            stream.paused
              ? undefined
              : {
                  accountId: stream.receiver.accountId,
                  config: stream.streamConfig.raw,
                },
          );

          const newReceivers = [
            ...currentReceivers,
            {
              accountId: stream.receiver.accountId,
              config: stream.streamConfig.raw,
            },
          ];

          const tx = addressDriverClient.setStreams(
            tokenAddress,
            currentReceivers,
            newReceivers,
            address,
            0,
          );

          return { tx };
        },

        transactions: (transactContext) => ({
          transaction: () => transactContext.tx,
        }),

        after: async () => {
          await expect(
            streams.refreshUserAccount,
            () => streams.getStreamById(stream.id)?.paused === false,
            5000,
            1000,
          );
        },
      }),
    );
  });
</script>
