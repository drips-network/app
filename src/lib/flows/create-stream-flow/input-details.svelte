<script lang="ts">
  import Dropdown from 'radicle-design-system/Dropdown.svelte';
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import balances from '$lib/stores/balances';
  import tokens from '$lib/stores/tokens';
  import { ethers } from 'ethers';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import Button from '$lib/components/button/button.svelte';
  import {
    getAddressDriverClient,
    getCallerClient,
    getNetworkConfig,
  } from '$lib/utils/get-drips-clients';
  import streams from '$lib/stores/streams';
  import assert from '$lib/utils/assert';
  import { AddressDriverPresets, constants, Utils } from 'radicle-drips';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents, UpdateAwaitStepFn } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import expect from '$lib/utils/expect';
  import {
    generateMetadata,
    pinAccountMetadata,
    streamMetadataSchema,
  } from '$lib/stores/streams/metadata';
  import makeStreamId from '$lib/stores/streams/methods/make-stream-id';
  import type { z } from 'zod';
  import wallet from '$lib/stores/wallet';
  import StreamVisual from '$lib/components/stream-visual/stream-visual.svelte';
  import etherscanLink from '$lib/utils/etherscan-link';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import Token from '$lib/components/token/token.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import InputAddress from '$lib/components/input-address/input-address.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let streamNameValue: string;

  // Recipient Address

  let recipientAddressValue = '';
  let recipientAddressValidationState: TextInputValidationState = { type: 'unvalidated' };

  function onAddressValidationChange(event: CustomEvent) {
    recipientAddressValidationState = event.detail ?? { type: 'unvalidated' };
  }

  // Token dropdown

  let tokenList: Items;
  $: tokenList = Object.fromEntries(
    $balances.streamable.map((amount) => {
      const token = tokens.getByAddress(amount.tokenAddress);
      assert(token);

      return [
        token.info.address,
        {
          type: 'selectable',
          label: token.info.name,
          text: `${formatTokenAmount(amount, token.info.decimals)} ${token.info.symbol}`,
          image: {
            component: Token,
            props: {
              show: 'none',
              address: token.info.address,
              size: 'small',
            },
          },
        },
      ];
    }) ?? [],
  );

  let selectedTokenAddress: string[] = [];
  $: selectedToken =
    selectedTokenAddress.length === 1 ? tokens.getByAddress(selectedTokenAddress[0]) : undefined;

  // Amount input

  let amountValue: string | undefined;

  // Multiplier dropdown

  let selectedMultiplier = '1';

  // Amount per second

  $: amountPerSecond =
    amountValue && selectedMultiplier && selectedToken
      ? (ethers.utils.parseUnits(amountValue, selectedToken.info.decimals).toBigInt() *
          BigInt(constants.AMT_PER_SEC_MULTIPLIER)) /
        BigInt(selectedMultiplier)
      : undefined;

  // Stream end date
  // TODO: Validate that the end date is far enough into the future that the stream won't
  // just immediately cease after a TX confirmation delay.
  let streamEndDateValue: string;
  let streamEndDate: Date | undefined;
  let streamEndDateValidationState: TextInputValidationState = { type: 'unvalidated' };
  $: {
    const validationRegex = /^\d{4}-\d{2}-\d{2}$/;
    streamEndDate = undefined;

    if (!streamEndDateValue) {
      streamEndDateValidationState = {
        type: 'unvalidated',
      };
    } else if (streamEndDateValue.match(validationRegex)) {
      const parsed = new Date(streamEndDateValue);
      const isInFuture = new Date().getTime() < parsed.getTime();

      if (isInFuture) {
        streamEndDateValidationState = {
          type: 'valid',
        };
        streamEndDate = new Date(streamEndDateValue);
      } else {
        streamEndDateValidationState = {
          type: 'invalid',
          message: 'The end date must be a valid date in the future.',
        };
      }
    } else {
      streamEndDateValidationState = {
        type: 'invalid',
        message: 'Enter a valid date in format YYYY-MM-DD',
      };
    }
  }

  $: formValid =
    streamEndDateValidationState.type !== 'invalid' &&
    recipientAddressValidationState.type === 'valid' &&
    amountPerSecond &&
    streamNameValue;

  function submit() {
    const promise = async (updateAwaitStep: UpdateAwaitStepFn) => {
      modal.setHideable(false);

      const callerClient = await getCallerClient();
      const addressDriverClient = await getAddressDriverClient();
      const ownUserId = (await addressDriverClient.getUserId()).toString();

      assert(
        selectedToken && amountPerSecond && recipientAddressValue && streamNameValue,
        "Form isn't valid",
      );

      const { address: tokenAddress } = selectedToken.info;
      const ownAccount = $streams.accounts[ownUserId];
      assert(ownAccount, "App hasn't yet fetched user's own account");

      const assetConfig = ownAccount.assetConfigs.find((ac) => ac.tokenAddress === tokenAddress);
      assert(assetConfig, "App hasn't yet fetched the right asset config");

      const currentReceivers = assetConfig.streams.map((stream) => ({
        userId: stream.receiver.userId,
        config: stream.dripsConfig.raw,
      }));

      const duration = streamEndDate
        ? BigInt(Math.floor((streamEndDate.getTime() - new Date().getTime()) / 1000))
        : 0n;

      const dripId = ethers.BigNumber.from(ethers.utils.randomBytes(4)).toBigInt();

      const dripConfig = Utils.DripsReceiverConfiguration.toUint256({
        dripId,
        start: 0n,
        duration,
        amountPerSec: amountPerSecond,
      });

      const recipientUserId = await addressDriverClient.getUserIdByAddress(recipientAddressValue);
      const { address } = $wallet;
      assert(address);

      const newStreamMetadata: z.infer<typeof streamMetadataSchema> = {
        id: makeStreamId(ownUserId, tokenAddress, dripId.toString()),
        initialDripsConfig: {
          dripId: dripId.toString(),
          raw: dripConfig.toString(),
          startTimestamp: 0,
          durationSeconds: Number(duration),
          amountPerSecond,
        },
        receiver: {
          userId: recipientUserId.toString(),
          driver: 'address',
        },
        archived: false,
        name: streamNameValue,
      };

      const accountMetadata = generateMetadata(ownAccount, address);
      const currentAssetConfigIndex = accountMetadata.assetConfigs.findIndex(
        (ac) => ac.tokenAddress === tokenAddress,
      );

      if (currentAssetConfigIndex === -1) {
        accountMetadata.assetConfigs.push({
          tokenAddress,
          streams: [newStreamMetadata],
        });
      } else {
        const current = accountMetadata.assetConfigs[currentAssetConfigIndex];
        accountMetadata.assetConfigs[currentAssetConfigIndex] = {
          ...current,
          streams: [...current.streams, newStreamMetadata],
        };
      }

      const newHash = await pinAccountMetadata(accountMetadata);

      const { CONTRACT_ADDRESS_DRIVER } = getNetworkConfig();

      const createStreamBatchPreset = AddressDriverPresets.Presets.createNewStreamFlow({
        key: 65932473927847481224664369441494644980717748729109625944182088338412766444512n,
        driverAddress: CONTRACT_ADDRESS_DRIVER,
        tokenAddress,
        currentReceivers,
        newReceivers: [
          ...currentReceivers,
          {
            config: dripConfig,
            userId: recipientUserId,
          },
        ],
        value: newHash,
        balanceDelta: 0,
        transferToAddress: address,
      });

      const waitingWalletIcon = {
        component: Emoji,
        props: {
          emoji: '👛',
          size: 'huge',
        },
      };

      updateAwaitStep({
        icon: waitingWalletIcon,
        message: 'Waiting for you to confirm the transaction in your wallet...',
      });

      const tx = await callerClient.callBatched(createStreamBatchPreset);

      updateAwaitStep({
        message: 'Waiting for your transaction to be confirmed…',
        link: {
          label: 'View on Etherscan',
          url: etherscanLink($wallet.network.name, tx.hash),
        },
      });

      await tx.wait();

      updateAwaitStep({
        message: 'Wrapping up…',
      });

      /*
      We wait up to five seconds for `refreshUserAccount` to update the user's own
      account's `lastIpfsHash` to the new hash we just published.
      */
      await expect(
        streams.refreshUserAccount,
        () => $streams.accounts[ownUserId].lastIpfsHash === newHash,
        5000,
        1000,
      );

      modal.setHideable(true);
    };

    dispatch('await', {
      message: 'Preparing to create the stream...',
      promise,
    });
  }
</script>

<StepLayout>
  <StreamVisual fromAddress={$wallet.address} toAddress={recipientAddressValue} {amountPerSecond} />
  <StepHeader
    headline="Create stream"
    description="Stream any ERC-20 token to anyone with an Ethereum address."
  />
  <FormField title="Stream name*">
    <TextInput bind:value={streamNameValue} placeholder="Enter any name" />
  </FormField>
  <FormField title="Stream to*">
    <InputAddress
      bind:validatedValue={recipientAddressValue}
      on:validationChange={onAddressValidationChange}
    />
  </FormField>
  <FormField title="Token*">
    <div class="list-container">
      <ListSelect
        bind:selected={selectedTokenAddress}
        items={tokenList}
        searchable={Object.keys(tokenList).length > 5}
        emptyStateText={'No tokens available to stream. Top up a token first by clicking "Top up" on your Dashboard.'}
      />
    </div>
  </FormField>
  <div class="form-row">
    <FormField title="Stream rate*">
      <TextInput
        suffix={selectedToken?.info.symbol}
        bind:value={amountValue}
        variant={{ type: 'number', min: 0 }}
        placeholder="Amount"
      />
    </FormField>
    <FormField title="Amount per*">
      <Dropdown
        bind:value={selectedMultiplier}
        options={[
          {
            value: '1',
            title: '/ second',
          },
          {
            value: '3600',
            title: '/ hour',
          },
          {
            value: '86400',
            title: '/ day',
          },
          {
            value: '604800',
            title: '/ week',
          },
          {
            value: '2592000',
            title: '/ 30 days',
          },
          {
            value: '31536000',
            title: '/ year',
          },
        ]}
      />
    </FormField>
  </div>
  <FormField title="Stream end date">
    <TextInput
      validationState={streamEndDateValidationState}
      placeholder="YYYY-MM-DD"
      bind:value={streamEndDateValue}
    />
  </FormField>
  <svelte:fragment slot="actions">
    <Button on:click={submit} disabled={!formValid}>Create stream</Button>
  </svelte:fragment>
</StepLayout>

<style>
  .form-row {
    display: flex;
    gap: 1rem;
  }

  .list-container {
    max-height: 24rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 0.5rem;
    overflow: scroll;
  }
</style>
