<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { createEventDispatcher, onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import streamsStore from '$lib/stores/streams/streams.store';
  import unreachable from '$lib/utils/unreachable';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import { Utils } from 'radicle-drips';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let dripListId: string;

  let ownerAccountId = $walletStore.dripsAccountId ?? unreachable();
  let supportStreams =
    $streamsStore &&
    streamsStore
      .getStreamsForUser(ownerAccountId)
      .outgoing.filter((s) => s.receiver.accountId === dripListId);

  let supportStream = supportStreams[0] ?? unreachable();

  onMount(() => {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const { dripsAccountId } = $walletStore;
          assert(dripsAccountId);

          const ownAccount = $streamsStore.accounts[dripsAccountId];
          assert(ownAccount);

          const token =
            tokensStore.getByAddress(supportStream.streamConfig.amountPerSecond.tokenAddress) ??
            unreachable();

          const assetConfig = ownAccount.assetConfigs.find(
            (ac) => ac.tokenAddress === token.info.address,
          );
          assert(assetConfig);

          const currentReceivers = mapFilterUndefined(assetConfig.streams, (s) =>
            s.paused
              ? undefined
              : {
                  accountId: s.receiver.accountId,
                  config: s.streamConfig.raw,
                },
          );

          const newReceivers = structuredClone(currentReceivers);

          const currentStreamReceiverIndex = newReceivers.findIndex(
            (r) =>
              Utils.StreamConfiguration.fromUint256(r.config).dripId ===
              BigInt(supportStream.streamConfig.dripId),
          );

          newReceivers.splice(currentStreamReceiverIndex, 1);

          const addressDriverClient = await getAddressDriverClient();

          const tx = addressDriverClient.setStreams(
            token.info.address,
            currentReceivers,
            newReceivers,
            ownAccount.user.address,
            0n,
          );

          return { tx };
        },

        transactions: ({ tx }) => ({ transaction: () => tx }),
      }),
    );
  });
</script>
