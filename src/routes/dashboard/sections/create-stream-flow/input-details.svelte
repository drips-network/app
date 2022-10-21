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
  import ens from '$lib/stores/ens';
  import Button from '$lib/components/button/button.svelte';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import streams from '$lib/stores/streams';
  import assert from '$lib/utils/assert';
  import { constants, Utils } from 'radicle-drips';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents, UpdateAwaitStepFn } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import expect from '$lib/utils/expect';
  import {
    generateMetadata,
    streamMetadataSchema,
    updateAccountMetadata,
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

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let streamNameValue: string;

  // Recipient Address

  let recipientAddressValue: string;
  let recipientAddress: string | undefined;
  let recipientAddressValidationState: TextInputValidationState = { type: 'unvalidated' };

  async function updateReceipientAddress(value: string | undefined) {
    if (!value) {
      recipientAddressValidationState = { type: 'unvalidated' };
      recipientAddress = undefined;
      return;
    }

    if (value.endsWith('.eth')) {
      recipientAddressValidationState = {
        type: 'pending',
      };

      await ens.reverseLookup(value);
      const result = Object.entries($ens).find((item) => item[1].name === value);

      if (result) {
        const [address] = result;
        recipientAddress = address;
        recipientAddressValue = address;

        recipientAddressValidationState = {
          type: 'valid',
        };
      } else {
        recipientAddress = undefined;
        recipientAddressValidationState = {
          type: 'invalid',
          message: 'Unable to resolve ENS name',
        };
      }
    } else if (value && ethers.utils.isAddress(value)) {
      recipientAddress = value;
      recipientAddressValidationState = {
        type: 'valid',
      };
    } else {
      recipientAddress = undefined;
      recipientAddressValidationState = {
        type: 'invalid',
        message: 'Enter either an ENS name or valid Ethereum address',
      };
    }
  }
  $: updateReceipientAddress(recipientAddressValue);

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
              hideName: true,
              address: token.info.address,
              small: true,
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
      streamEndDateValidationState = {
        type: 'valid',
      };
      streamEndDate = new Date(streamEndDateValue);
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
      updateAwaitStep({
        message: 'Preparing…',
      });

      modal.setHideable(false);
      const client = await getAddressDriverClient();
      const ownUserId = (await client.getUserId()).toString();

      assert(
        selectedToken && amountPerSecond && recipientAddress && streamNameValue,
        "Form isn't valid",
      );

      const { address: tokenAddress } = selectedToken.info;
      const ownAccount = $streams.accounts[ownUserId];
      const assetConfig = ownAccount.assetConfigs.find((ac) => ac.tokenAddress === tokenAddress);
      assert(assetConfig, "App hasn't yet fetched the right asset config");

      // TODO: Use a batched call here for receivers & metadata update once SDK supports it

      const currentReceivers = assetConfig.streams.map((stream) => ({
        userId: stream.receiver.userId,
        config: stream.dripsConfig.raw,
      }));

      const duration = streamEndDate
        ? BigInt((streamEndDate.getTime() - new Date().getTime()) / 1000)
        : 0n;

      const dripId = ethers.BigNumber.from(ethers.utils.randomBytes(4)).toBigInt();

      const dripConfig = Utils.DripsReceiverConfiguration.toUint256({
        dripId,
        start: 0n,
        duration,
        amountPerSec: amountPerSecond,
      });

      const recipientUserId = await client.getUserIdByAddress(recipientAddress);
      const { signerAddress } = client;

      const waitingWalletIcon = {
        component: Emoji,
        props: {
          emoji: '👛',
          size: 'huge',
        },
      };

      updateAwaitStep({
        icon: waitingWalletIcon,
        message: 'Waiting for you to confirm transaction 1/2 in your wallet',
      });

      const setDripsTx = await client.setDrips(
        tokenAddress,
        currentReceivers,
        [
          ...currentReceivers,
          {
            config: dripConfig,
            userId: recipientUserId,
          },
        ],
        signerAddress,
      );

      updateAwaitStep({
        message: 'Waiting for transaction 1/2 to be confirmed…',
        link: {
          label: 'View on Etherscan',
          url: etherscanLink($wallet.network.name, setDripsTx.hash),
        },
      });

      await setDripsTx.wait();

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

      const accountMetadata = generateMetadata(ownAccount, client.signerAddress);
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

      updateAwaitStep({
        icon: waitingWalletIcon,
        message: 'Waiting for you to confirm transaction 2/2 in your wallet',
      });

      const { newHash, tx: updateMetadataTx } = await updateAccountMetadata(
        accountMetadata,
        ownAccount.lastIpfsHash,
      );

      updateAwaitStep({
        message: 'Waiting for transaction 2/2 to be confirmed…',
        link: {
          label: 'View on Etherscan',
          url: etherscanLink($wallet.network.name, updateMetadataTx.hash),
        },
      });

      await updateMetadataTx.wait();

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
      message: 'Waiting for your transaction to be confirmed...',
      promise,
    });
  }
</script>

<StepLayout>
  <StreamVisual fromAddress={$wallet.address} toAddress={recipientAddress} {amountPerSecond} />
  <StepHeader
    headline="Create stream"
    description="Stream any ERC-20 token to anyone with an Ethereum address."
  />
  <FormField title="Stream name*">
    <TextInput bind:value={streamNameValue} placeholder="Enter any name" />
  </FormField>
  <FormField title="Stream to*">
    <TextInput
      showSuccessCheck
      validationState={recipientAddressValidationState}
      bind:value={recipientAddressValue}
      placeholder="ENS name or ETH address"
    />
  </FormField>
  <FormField title="Token*">
    <div class="list-container">
      <ListSelect
        bind:selected={selectedTokenAddress}
        items={tokenList}
        searchable={Object.keys(tokenList).length > 5}
      />
    </div>
    <!-- <Dropdown
      bind:value={selectedTokenAddress}
      options={$balances.streamable.map((balance) => ({
        value: balance.tokenAddress,
        title: tokens.getByAddress(balance.tokenAddress)?.info.name ?? 'Unknown token',
      }))}
    /> -->
  </FormField>
  <div class="form-row">
    <FormField title="Stream rate*">
      <div class="form-row">
        <div>
          <TextInput
            suffix={selectedToken?.info.symbol}
            bind:value={amountValue}
            variant={{ type: 'number', min: 0 }}
            placeholder="Amount"
          />
        </div>
        <div>
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
        </div>
      </div>
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

  .form-row * {
    flex: 1;
  }

  .list-container {
    max-height: 24rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 0.5rem;
    overflow: scroll;
  }
</style>
