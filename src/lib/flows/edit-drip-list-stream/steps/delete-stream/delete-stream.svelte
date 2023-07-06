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

  let ownerUserId = $walletStore.dripsUserId ?? unreachable();
  let supportStreams =
    $streamsStore &&
    streamsStore
      .getStreamsForUser(ownerUserId)
      .outgoing.filter((s) => s.receiver.userId === dripListId);

  let supportStream = supportStreams[0] ?? unreachable();

  onMount(() => {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const { dripsUserId } = $walletStore;
          assert(dripsUserId);

          const ownAccount = $streamsStore.accounts[dripsUserId];
          assert(ownAccount);

          const token =
            tokensStore.getByAddress(supportStream.dripsConfig.amountPerSecond.tokenAddress) ??
            unreachable();

          const assetConfig = ownAccount.assetConfigs.find(
            (ac) => ac.tokenAddress === token.info.address,
          );
          assert(assetConfig);

          const currentReceivers = mapFilterUndefined(assetConfig.streams, (s) =>
            s.paused
              ? undefined
              : {
                  userId: s.receiver.userId,
                  config: s.dripsConfig.raw,
                },
          );

          const newReceivers = structuredClone(currentReceivers);

          const currentStreamReceiverIndex = newReceivers.findIndex(
            (r) =>
              Utils.DripsReceiverConfiguration.fromUint256(r.config).dripId ===
              BigInt(supportStream.dripsConfig.dripId),
          );

          newReceivers.splice(currentStreamReceiverIndex, 1);

          const addressDriverClient = await getAddressDriverClient();

          const tx = addressDriverClient.setDrips(
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
