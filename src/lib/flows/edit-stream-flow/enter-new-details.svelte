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
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import { AddressDriverPresets, constants, Utils } from 'radicle-drips';
  import assert from '$lib/utils/assert';
  import wallet from '$lib/stores/wallet/wallet.store';
  import streams from '$lib/stores/streams';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import {
    generateMetadata,
    pinAccountMetadata,
    USER_DATA_KEY,
  } from '$lib/stores/streams/metadata';
  import {
    getAddressDriverClient,
    getCallerClient,
    getNetworkConfig,
  } from '$lib/utils/get-drips-clients';
  import type { ContractTransaction } from 'ethers';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import expect from '$lib/utils/expect';
  import { get } from 'svelte/store';
  import { validateAmtPerSecInput } from '$lib/utils/validate-amt-per-sec';
  import modal from '$lib/stores/modal';
  import { formatUnits } from 'ethers/lib/utils';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: Stream;

  const token =
    tokens.getByAddress(stream.dripsConfig.amountPerSecond.tokenAddress) ?? unreachable();

  let newName: string | undefined = stream.name;
  let newSelectedMultiplier = '1';
  let newAmountValue: string | undefined = formatUnits(
    stream.dripsConfig.amountPerSecond.amount / BigInt(newSelectedMultiplier),
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
  $: amountUpdated = newAmountPerSecond !== stream.dripsConfig.amountPerSecond.amount;
  $: canUpdate =
    newAmountValueParsed &&
    newName &&
    (nameUpdated || amountUpdated) &&
    amountValidationState?.type === 'valid';

  function updateStream() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          assert(newAmountPerSecond && newName);

          const { dripsUserId, address } = $wallet;
          assert(dripsUserId && address);
          const ownAccount = $streams.accounts[dripsUserId];
          assert(ownAccount);
          const assetConfig = ownAccount.assetConfigs.find(
            (ac) => ac.tokenAddress === token.info.address,
          );
          assert(assetConfig);

          let newHash = ownAccount.lastIpfsHash;

          if (nameUpdated) {
            const accountMetadata = generateMetadata(ownAccount, address);

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

            newHash = await pinAccountMetadata(accountMetadata);
          }

          let currentReceivers: {
            userId: string;
            config: bigint;
          }[] = [];

          let newReceivers: {
            userId: string;
            config: bigint;
          }[] = [];

          if (amountUpdated) {
            currentReceivers = mapFilterUndefined(assetConfig.streams, (s) =>
              s.paused
                ? undefined
                : {
                    userId: s.receiver.userId,
                    config: s.dripsConfig.raw,
                  },
            );

            newReceivers = structuredClone(currentReceivers);
            const currentStreamReciverIndex = newReceivers.findIndex(
              (r) =>
                Utils.DripsReceiverConfiguration.fromUint256(r.config).dripId ===
                BigInt(stream.dripsConfig.dripId),
            );
            newReceivers.splice(currentStreamReciverIndex, 1, {
              userId: stream.receiver.userId,
              config: Utils.DripsReceiverConfiguration.toUint256({
                dripId: BigInt(stream.dripsConfig.dripId),
                start: BigInt(stream.dripsConfig.startDate?.getTime() ?? 0 / 1000),
                duration: BigInt(stream.dripsConfig.durationSeconds ?? 0),
                amountPerSec: newAmountPerSecond,
              }),
            });
          }

          const addressDriverClient = await getAddressDriverClient();
          const callerClient = await getCallerClient();

          let tx: Promise<ContractTransaction>;

          if (amountUpdated && nameUpdated) {
            assert(newHash);
            const { CONTRACT_ADDRESS_DRIVER } = getNetworkConfig();

            const createStreamBatchPreset = AddressDriverPresets.Presets.createNewStreamFlow({
              driverAddress: CONTRACT_ADDRESS_DRIVER,
              tokenAddress: token.info.address,
              currentReceivers,
              newReceivers,
              userMetadata: [
                {
                  key: USER_DATA_KEY,
                  value: newHash,
                },
              ],
              balanceDelta: 0,
              transferToAddress: address,
            });

            tx = callerClient.callBatched(createStreamBatchPreset);
          } else if (amountUpdated) {
            tx = addressDriverClient.setDrips(
              token.info.address,
              currentReceivers,
              newReceivers,
              address,
              0n,
            );
          } else {
            assert(newHash);

            tx = addressDriverClient.emitUserMetadata([
              {
                key: USER_DATA_KEY,
                value: newHash,
              },
            ]);
          }

          return {
            tx,
            newHash,
            dripsUserId,
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
                ? get(streams).accounts[transactContext.dripsUserId].lastIpfsHash ===
                  transactContext.newHash
                : streams.getStreamById(stream.id)?.dripsConfig.amountPerSecond.amount ===
                  newAmountPerSecond,
            5000,
            1000,
          );
        },
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader headline="Edit stream" description="Set a new name or edit the stream rate." />
  <FormField title="New name*">
    <TextInput bind:value={newName} />
  </FormField>
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
  <svelte:fragment slot="actions">
    <Button on:click={modal.hide}>Cancel</Button>
    <Button variant="primary" on:click={updateStream} disabled={!canUpdate}>Update stream</Button>
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
