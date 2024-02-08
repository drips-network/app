<script lang="ts">
  import wallet from '$lib/stores/wallet/wallet.store';
  import { createEventDispatcher, onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import { getAddressDriverTxFactory } from '$lib/utils/get-drips-clients';
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

          const newStreams = assetConfig.streams.filter((s) => s.id !== stream.id);

          const newReceivers = newStreams.map((stream) => ({
            accountId: stream.receiver.accountId,
            config: stream.streamConfig.raw,
          }));

          const txFactory = await getAddressDriverTxFactory();
          const tx = await txFactory.setStreams(
            tokenAddress,
            currentReceivers,
            0,
            newReceivers,
            0,
            0,
            address,
          );

          return { tx };
        },

        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: true,
          },
        ],

        after: async () => {
          /*
          We wait up to five seconds for `refreshUserAccount` to update the user's own
          account's `lastIpfsHash` to the new hash we just published.
          */
          await expect(
            streams.refreshUserAccount,
            () => streams.getStreamById(stream.id)?.paused === true,
            5000,
            1000,
          );
        },
      }),
    );
  });
</script>
