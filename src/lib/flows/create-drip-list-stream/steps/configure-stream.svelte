<script lang="ts">
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import SupportStreamEditor from '$lib/components/support-stream-editor/support-stream-editor.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { createEventDispatcher } from 'svelte';
  import assert from '$lib/utils/assert';
  import streamsStore from '$lib/stores/streams/streams.store';
  import unreachable from '$lib/utils/unreachable';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import { Utils } from 'radicle-drips';
  import randomBigintUntilUnique from '$lib/utils/random-bigint-until-unique';
  import { decodeStreamId } from '$lib/stores/streams/methods/make-stream-id';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import Button from '$lib/components/button/button.svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let dripListId: string;

  let selectedTokenAddress: string | undefined = undefined;
  let streamRateValueParsed: bigint | undefined = undefined;

  let formValid: boolean;

  function submit() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          assert(selectedTokenAddress && streamRateValueParsed);

          const { dripsUserId } = $walletStore;
          assert(dripsUserId);

          const ownAccount = $streamsStore.accounts[dripsUserId];
          assert(ownAccount);

          const assetConfig = ownAccount.assetConfigs.find(
            (ac) =>
              ac.tokenAddress.toLowerCase() ===
              (selectedTokenAddress ?? unreachable()).toLowerCase(),
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

          const dripId = randomBigintUntilUnique(
            assetConfig.streams.map((s) => BigInt(decodeStreamId(s.id).dripId)),
            4,
          );

          const dripConfig = Utils.DripsReceiverConfiguration.toUint256({
            dripId,
            start: 0n,
            duration: 0n,
            amountPerSec: streamRateValueParsed / BigInt(2592000), // 30 days in seconds
          });

          const addressDriverClient = await getAddressDriverClient();

          const tx = addressDriverClient.setDrips(
            assetConfig.tokenAddress,
            currentReceivers,
            [
              ...currentReceivers,
              {
                userId: dripListId,
                config: dripConfig,
              },
            ],
            $walletStore.address ?? unreachable(),
            0n,
          );

          return { tx };
        },
        transactions: ({ tx }) => ({ transaction: () => tx }),
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader
    emoji="💸"
    headline="Support your Drip List"
    description="Choose your new support token & rate."
  />
  <SupportStreamEditor
    bind:formValid
    bind:selectedTokenAddress
    bind:streamRateValueParsed
    withoutTopUp
  />
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} on:click={submit} icon={Wallet} variant="primary"
      >Confirm in wallet</Button
    >
  </svelte:fragment>
</StepLayout>
