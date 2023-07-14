<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import SupportStreamEditor from '$lib/components/support-stream-editor/support-stream-editor.svelte';
  import streamsStore from '$lib/stores/streams/streams.store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import { createEventDispatcher } from 'svelte';
  import assert from '$lib/utils/assert';
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

  let selectedTokenAddress = supportStream.streamConfig.amountPerSecond.tokenAddress;
  let streamRateValueParsed = supportStream.streamConfig.amountPerSecond.amount * 2592000n; // 30 days in seconds

  let formValid: boolean;

  function handleSubmit() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const ownAccount = $streamsStore.accounts[ownerAccountId];
          assert(ownAccount);

          const token = tokensStore.getByAddress(selectedTokenAddress) ?? unreachable();

          const tokenAssetConfig = ownAccount.assetConfigs.find(
            (ac) => ac.tokenAddress === token.info.address,
          );
          assert(tokenAssetConfig);

          const currentReceivers = mapFilterUndefined(tokenAssetConfig.streams, (s) =>
            s.paused
              ? undefined
              : {
                  accountId: s.receiver.accountId,
                  config: s.streamConfig.raw,
                },
          );

          const newReceivers = structuredClone(currentReceivers);

          const receiverToInsert = {
            accountId: supportStream.receiver.accountId,
            config: Utils.StreamConfiguration.toUint256({
              dripId: BigInt(supportStream.streamConfig.dripId),
              start: 0n,
              duration: 0n,
              amountPerSec: streamRateValueParsed / 2592000n, // 30 days in seconds
            }),
          };

          const currentStreamReceiverIndex = newReceivers.findIndex(
            (r) =>
              Utils.StreamConfiguration.fromUint256(r.config).dripId ===
              BigInt(supportStream.streamConfig.dripId),
          );

          newReceivers.splice(currentStreamReceiverIndex, 1, receiverToInsert);

          const addressDriverClient = await getAddressDriverClient();

          const setNewStreamTx = addressDriverClient.setStreams(
            token.info.address,
            currentReceivers,
            newReceivers,
            ownAccount.user.address,
            0n,
          );

          return { setNewStreamTx };
        },

        // If we need to remove an old stream from a different asset config, we send a batch of two TXs, otherwise just one.
        transactions: ({ setNewStreamTx }) => ({
          transaction: () => setNewStreamTx,
        }),
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader emoji="✏️" headline="Edit Support Rate" />
  <SupportStreamEditor
    bind:formValid
    bind:selectedTokenAddress
    bind:streamRateValueParsed
    withoutTopUp
    withoutToken
  />
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} on:click={handleSubmit} icon={Wallet} variant="primary"
      >Confirm changes in wallet</Button
    >
  </svelte:fragment>
</StepLayout>
