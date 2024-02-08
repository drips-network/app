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
  import { getAddressDriverTxFactory } from '$lib/utils/get-drips-clients';
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

          const { dripsAccountId } = $walletStore;
          assert(dripsAccountId);

          const ownAccount = $streamsStore.accounts[dripsAccountId];
          assert(ownAccount);

          const assetConfig = ownAccount.assetConfigs.find(
            (ac) =>
              ac.tokenAddress.toLowerCase() ===
              (selectedTokenAddress ?? unreachable()).toLowerCase(),
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

          const dripId = randomBigintUntilUnique(
            assetConfig.streams.map((s) => BigInt(decodeStreamId(s.id).dripId)),
            4,
          );

          const dripConfig = Utils.StreamConfiguration.toUint256({
            dripId,
            start: 0n,
            duration: 0n,
            amountPerSec: streamRateValueParsed / BigInt(2592000), // 30 days in seconds
          });

          const txFactory = await getAddressDriverTxFactory();

          const tx = await txFactory.setStreams(
            assetConfig.tokenAddress,
            currentReceivers,
            0n,
            [
              ...currentReceivers,
              {
                accountId: dripListId,
                config: dripConfig,
              },
            ],
            0n,
            0n,
            $walletStore.address ?? unreachable(),
          );

          return { tx };
        },

        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: true,
          },
        ],
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
