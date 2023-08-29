<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { Stream } from '$lib/stores/streams/types';
  import tokens from '$lib/stores/tokens';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import unreachable from '$lib/utils/unreachable';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { AddressDriverPresets, constants, Utils } from 'radicle-drips';
  import assert from '$lib/utils/assert';
  import wallet from '$lib/stores/wallet/wallet.store';
  import streams from '$lib/stores/streams';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import {
    getAddressDriverClient,
    getCallerClient,
    getNetworkConfig,
  } from '$lib/utils/get-drips-clients';
  import type { ContractTransaction } from 'ethers';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import expect from '$lib/utils/expect';
  import { get, type Writable } from 'svelte/store';
  import { validateAmtPerSecInput } from '$lib/utils/validate-amt-per-sec';
  import modal from '$lib/stores/modal';
  import { formatUnits } from 'ethers/lib/utils';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';
  import type { EditStreamFlowState } from './edit-stream-flow-state';
  import AddressDriverMetadataManager from '$lib/utils/metadata/AddressDriverMetadataManager';
  import MetadataManagerBase from '$lib/utils/metadata/MetadataManagerBase';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: Stream;
  export let context: Writable<EditStreamFlowState>;

  const restorer = $context.restorer;

  const token =
    tokens.getByAddress(stream.streamConfig.amountPerSecond.tokenAddress) ?? unreachable();

  let newName: string | undefined = restorer.restore('newName') ?? stream.name;
  let newSelectedMultiplier = restorer.restore('newAmountValue')
    ? restorer.restore('newSelectedMultiplier')
    : '1';
  let newAmountValue: string | undefined =
    restorer.restore('newAmountValue') ??
    formatUnits(
      stream.streamConfig.amountPerSecond.amount / BigInt(newSelectedMultiplier),
      token.info.decimals + constants.AMT_PER_SEC_EXTRA_DECIMALS,
    );

  $: amountLocked = stream.paused === true;

  $: newAmountValueParsed = newAmountValue
    ? parseTokenAmount(newAmountValue, token.info.decimals + constants.AMT_PER_SEC_EXTRA_DECIMALS)
    : undefined;

  $: newAmountPerSecond = newAmountValueParsed
    ? newAmountValueParsed / BigInt(newSelectedMultiplier)
    : undefined;

  $: amountValidationState = validateAmtPerSecInput(newAmountPerSecond);

  $: nameUpdated = newName !== stream.name;
  $: amountUpdated = newAmountPerSecond !== stream.streamConfig.amountPerSecond.amount;
  $: canUpdate =
    newAmountValueParsed &&
    (!stream.managed || newName) &&
    (nameUpdated || amountUpdated) &&
    amountValidationState?.type === 'valid';

  function updateStream() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          assert(newAmountPerSecond);

          if (stream.managed) assert(newName);

          const { dripsAccountId, address, signer } = $wallet;
          assert(dripsAccountId && address);
          const ownAccount = $streams.accounts[dripsAccountId];
          assert(ownAccount);
          const assetConfig = ownAccount.assetConfigs.find(
            (ac) => ac.tokenAddress === token.info.address,
          );
          assert(assetConfig);

          let newHash = ownAccount.lastIpfsHash;

          if (nameUpdated) {
            const metadataMgr = new AddressDriverMetadataManager();

            const accountMetadata = metadataMgr.buildAccountMetadata({
              forAccount: ownAccount,
              address,
            });

            const currentAssetConfigIndex = accountMetadata.assetConfigs.findIndex(
              (ac) => ac.tokenAddress === token.info.address,
            );

            const currentStreamIndex = accountMetadata.assetConfigs[
              currentAssetConfigIndex
            ].streams.findIndex((s) => s.id === stream.id);

            const currentStream =
              accountMetadata.assetConfigs[currentAssetConfigIndex].streams[currentStreamIndex];

            accountMetadata.assetConfigs[currentAssetConfigIndex].streams[currentStreamIndex] = {
              ...currentStream,
              name: newName,
            };

            accountMetadata.timestamp = new Date().getTime() / 1000;

            newHash = await metadataMgr.pinAccountMetadata(accountMetadata);
          }

          let currentReceivers: {
            accountId: string;
            config: bigint;
          }[] = [];

          let newReceivers: {
            accountId: string;
            config: bigint;
          }[] = [];

          if (amountUpdated) {
            currentReceivers = mapFilterUndefined(assetConfig.streams, (s) =>
              s.paused
                ? undefined
                : {
                    accountId: s.receiver.accountId,
                    config: s.streamConfig.raw,
                  },
            );

            newReceivers = structuredClone(currentReceivers);
            const currentStreamReciverIndex = newReceivers.findIndex(
              (r) =>
                Utils.StreamConfiguration.fromUint256(r.config).dripId ===
                BigInt(stream.streamConfig.dripId),
            );
            newReceivers.splice(currentStreamReciverIndex, 1, {
              accountId: stream.receiver.accountId,
              config: Utils.StreamConfiguration.toUint256({
                dripId: BigInt(stream.streamConfig.dripId),
                start: BigInt(stream.streamConfig.startDate?.getTime() ?? 0 / 1000),
                duration: BigInt(stream.streamConfig.durationSeconds ?? 0),
                amountPerSec: newAmountPerSecond,
              }),
            });
          }

          const addressDriverClient = await getAddressDriverClient();
          const callerClient = await getCallerClient();

          let tx: Promise<ContractTransaction>;

          if (amountUpdated && nameUpdated) {
            assert(newHash);
            const { ADDRESS_DRIVER } = getNetworkConfig();

            const createStreamBatchPreset = await AddressDriverPresets.Presets.createNewStreamFlow({
              signer,
              driverAddress: ADDRESS_DRIVER,
              tokenAddress: token.info.address,
              currentReceivers,
              newReceivers,
              accountMetadata: [
                {
                  key: MetadataManagerBase.USER_METADATA_KEY,
                  value: newHash,
                },
              ],
              balanceDelta: 0,
              transferToAddress: address,
            });

            tx = callerClient.callBatched(createStreamBatchPreset);
          } else if (amountUpdated) {
            tx = addressDriverClient.setStreams(
              token.info.address,
              currentReceivers,
              newReceivers,
              address,
              0n,
            );
          } else {
            assert(newHash);

            tx = addressDriverClient.emitAccountMetadata([
              {
                key: MetadataManagerBase.USER_METADATA_KEY,
                value: newHash,
              },
            ]);
          }

          return {
            tx,
            newHash,
            dripsAccountId,
          };
        },

        transactions: (transactContext) => ({
          transaction: () => transactContext.tx,
        }),

        after: async (_, transactContext) => {
          /*
        We wait up to five seconds for `refreshUserAccount` to update either the account's
        lastIpfsHash or the stream's amount per second.
        */
          await expect(
            streams.refreshUserAccount,
            () =>
              nameUpdated
                ? get(streams).accounts[transactContext.dripsAccountId].lastIpfsHash ===
                  transactContext.newHash
                : streams.getStreamById(stream.id)?.streamConfig.amountPerSecond.amount ===
                  newAmountPerSecond,
            5000,
            1000,
          );
        },
      }),
    );
  }

  $: restorer.saveAll({
    newAmountValue,
    newName,
    newSelectedMultiplier,
  });
</script>

<StepLayout>
  <StepHeader
    headline="Edit stream"
    description={stream.managed
      ? 'Set a new name or edit the stream rate.'
      : 'Set a new stream rate.'}
  />
  {#if stream.managed}
    <FormField title="New name*">
      <TextInput bind:value={newName} />
    </FormField>
  {/if}
  <div class="form-row">
    <FormField title="New stream rate*" disabled={amountLocked}>
      <TextInput
        suffix={token.info.symbol}
        bind:value={newAmountValue}
        variant={{ type: 'number', min: 0 }}
        placeholder="Amount"
        validationState={amountValidationState}
        disabled={amountLocked}
      />
    </FormField>
    <FormField title="Amount per*" disabled={amountLocked}>
      <Dropdown
        disabled={amountLocked}
        bind:value={newSelectedMultiplier}
        options={[
          {
            value: '1',
            title: 'second',
          },
          {
            value: '60',
            title: 'minute',
          },
          {
            value: '3600',
            title: 'hour',
          },
          {
            value: '86400',
            title: 'day',
          },
          {
            value: '604800',
            title: 'week',
          },
          {
            value: '2592000',
            title: '30 days',
          },
          {
            value: '31536000',
            title: '365 days',
          },
        ]}
      />
    </FormField>
  </div>
  {#if amountLocked}
    <p class="typo-text">Currently, the stream rate can not be edited for paused streams.</p>
  {/if}
  <SafeAppDisclaimer disclaimerType="drips" />
  <svelte:fragment slot="actions">
    <Button on:click={modal.hide} variant="ghost">Cancel</Button>
    <Button variant="primary" icon={Wallet} on:click={updateStream} disabled={!canUpdate}
      >Confirm changes in wallet</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  .form-row {
    display: flex;
    gap: 1rem;
  }

  p {
    color: var(--color-foreground-level-5);
    text-align: left;
  }
</style>
