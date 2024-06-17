<script lang="ts" context="module">
  export const CREATE_STREAM_FLOW_DETAILS_NFT_DRIVER_ACCOUNT_FRAGMENT = gql`
    ${DRIP_VISUAL_NFT_DRIVER_ACCOUNT_FRAGMENT}
    fragment CreateStreamFlowDetailsNftDriverAccount on NftDriverAccount {
      ...DripVisualNftDriverAccount
      accountId
    }
  `;

  export const CREATE_STREAM_FLOW_ADDRESS_DRIVER_ACCOUNT_FRAGMENT = gql`
    ${DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT}
    fragment CreateStreamFlowAddressDriverAccount on AddressDriverAccount {
      ...DripVisualAddressDriverAccount
      address
      accountId
    }
  `;
</script>

<script lang="ts">
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import tokens from '$lib/stores/tokens';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import Button from '$lib/components/button/button.svelte';
  import { constants } from 'radicle-drips';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import wallet from '$lib/stores/wallet/wallet.store';
  import DripVisual, {
    DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT,
    DRIP_VISUAL_NFT_DRIVER_ACCOUNT_FRAGMENT,
  } from '$lib/components/drip-visual/drip-visual.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import Toggleable from '$lib/components/toggleable/toggleable.svelte';
  import type { Writable } from 'svelte/store';
  import unreachable from '$lib/utils/unreachable';
  import parseDate from './methods/parse-date';
  import parseTime from './methods/parse-time';
  import combineDateAndTime from './methods/combine-date-and-time';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import { validateAmtPerSecInput } from '$lib/utils/validate-amt-per-sec';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';
  import type { CreateStreamFlowState } from './create-stream-flow-state';
  import { Driver } from '$lib/graphql/__generated__/base-types';
  import { gql } from 'graphql-request';
  import Token from '$lib/components/token/token.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import RealtimeAmount from '$lib/components/amount/realtime-amount.svelte';
  import InputStreamReceiver from '$lib/components/input-address/input-stream-receiver.svelte';
  import { isAddress } from 'ethers/lib/utils';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import { buildStreamCreateBatchTx } from '$lib/utils/streams/streams';
  import { getAddressDriverClient, getCallerClient } from '$lib/utils/get-drips-clients';
  import assert from '$lib/utils/assert';
  import { waitForAccountMetadata } from '$lib/utils/ipfs';
  import { invalidateAll } from '$app/navigation';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<CreateStreamFlowState>;

  $: nameInputHidden = $context.receiver?.__typename === 'NftDriverAccount';

  // Recipient Address

  let recipientInputValidationState: TextInputValidationState = { type: 'unvalidated' };
  function onRecipientInputValidationChange(event: CustomEvent) {
    recipientInputValidationState = event.detail ?? { type: 'unvalidated' };
  }

  // Token dropdown

  let tokenList: Items;
  $: tokenList = Object.fromEntries(
    mapFilterUndefined($context.userOutgoingTokenBalances, (b) => {
      const token = tokens.getByAddress(b.tokenAddress);
      if (!token) return undefined;

      return [
        token.info.address.toLowerCase(),
        {
          type: 'selectable',
          label: token.info.name,
          searchString: [token.info.name, token.info.symbol],
          text: {
            component: RealtimeAmount,
            props: {
              tokenAddress: token.info.address,
              timeline: b.outgoing,
              showDelta: false,
            },
          },
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
    }),
  );

  onMount(() => {
    if ($context.selectedTokenAddress && $context.selectedTokenAddress.length !== 0) return;

    const firstToken = Object.keys(tokenList ?? {})[0];
    if (firstToken) $context.selectedTokenAddress = [firstToken];
  });

  $: selectedToken =
    $context.selectedTokenAddress?.length === 1
      ? tokens.getByAddress($context.selectedTokenAddress[0])
      : undefined;

  // Amount input

  $: amountValueParsed =
    $context.amountValue && selectedToken
      ? parseTokenAmount(
          $context.amountValue,
          selectedToken?.info.decimals + constants.AMT_PER_SEC_EXTRA_DECIMALS,
        )
      : undefined;

  // Amount per second

  $: amountPerSecond =
    amountValueParsed && $context.selectedMultiplier && selectedToken
      ? amountValueParsed / BigInt($context.selectedMultiplier)
      : undefined;

  $: amountValidationState = validateAmtPerSecInput(amountPerSecond);

  // Stream start date
  $: streamStartDate = parseDate($context.streamStartDateValue).date;
  $: streamStartDateValidationState = parseDate($context.streamStartDateValue).validationState;

  // Stream start time
  $: streamStartTime = parseTime($context.streamStartTimeValue).time;
  $: streamStartTimeValidationState = parseTime($context.streamStartTimeValue).validationState;

  // Stream end date
  $: streamEndDate = parseDate($context.streamEndDateValue).date;
  $: streamEndDateValidationState = parseDate($context.streamEndDateValue).validationState;

  // Stream end time
  $: streamEndTime = parseTime($context.streamEndTimeValue).time;
  $: streamEndTimeValidationState = parseTime($context.streamEndTimeValue).validationState;

  $: combinedStartDate =
    streamStartDate &&
    streamStartTime &&
    combineDateAndTime(streamStartDate ?? unreachable(), streamStartTime ?? unreachable());

  $: combinedEndDate =
    streamEndDate &&
    streamEndTime &&
    combineDateAndTime(streamEndDate ?? unreachable(), streamEndTime ?? unreachable());

  $: timeRangeValid =
    !$context.setStartAndEndDate ||
    (combinedStartDate &&
      combinedEndDate &&
      combinedStartDate.getTime() > new Date().getTime() &&
      combinedStartDate?.getTime() < combinedEndDate?.getTime());

  $: formValid =
    streamEndDateValidationState.type !== 'invalid' &&
    ($context.receiver || recipientInputValidationState.type === 'valid') &&
    amountValidationState?.type === 'valid' &&
    (nameInputHidden || $context.streamNameValue) &&
    timeRangeValid;

  function submit() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const callerClient = await getCallerClient();
          const addressDriverClient = await getAddressDriverClient();
          const { signer } = $wallet;
          assert(signer, 'No signer available');

          let recipientAccountId: string;
          if ($context.receiver) {
            recipientAccountId = $context.receiver.accountId;
          } else {
            const recipientInputValue = $context.recipientInputValue ?? unreachable();

            recipientAccountId = isAddress(recipientInputValue)
              ? await addressDriverClient.getAccountIdByAddress(recipientInputValue)
              : recipientInputValue;
          }

          const { batch, newHash } = await buildStreamCreateBatchTx(addressDriverClient, signer, {
            tokenAddress: $context.selectedTokenAddress?.[0] ?? unreachable(),
            amountPerSecond: amountPerSecond ?? unreachable(),
            recipientAccountId,
            name: $context.streamNameValue,
            startAt: combinedStartDate,
            durationSeconds:
              combinedEndDate && combinedStartDate
                ? Math.floor((combinedEndDate.getTime() - combinedStartDate.getTime()) / 1000)
                : undefined,
          });

          return {
            callerClient,
            batch,
            newHash,
          };
        },

        transactions: async ({ callerClient, batch }) => [
          {
            transaction: await callerClient.populateCallBatchedTx(batch),
            applyGasBuffer: true,
          },
        ],

        after: async (_, { newHash }) => {
          const { dripsAccountId } = $wallet;
          assert(dripsAccountId);

          await waitForAccountMetadata(dripsAccountId, newHash);

          await invalidateAll();
        },
      }),
    );
  }
</script>

<StepLayout>
  <DripVisual
    disableLinks
    from={$wallet.address
      ? {
          __typename: 'AddressDriverAccount',
          driver: Driver.Address,
          address: $wallet.address,
        }
      : undefined}
    to={$context.receiver
      ? $context.receiver
      : recipientInputValidationState.type === 'valid' && $context.recipientInputValue
      ? isAddress($context.recipientInputValue) // TODO: Extract to function when project receiver is supported.
        ? {
            __typename: 'AddressDriverAccount',
            driver: Driver.Address,
            address: $context.recipientInputValue,
          }
        : {
            __typename: 'NftDriverAccount',
            driver: Driver.Nft,
            accountId: $context.recipientInputValue,
          }
      : undefined}
    amountPerSecond={amountValidationState?.type === 'valid' ? amountPerSecond : undefined}
  />
  <StepHeader
    headline={$context.receiver ? 'Start a Continuous Donation' : 'Create stream'}
    description="Stream any ERC-20 token from your Drips account."
  />
  <FormField title="Stream name*">
    <TextInput bind:value={$context.streamNameValue} placeholder="Enter any name" />
  </FormField>
  {#if !$context.receiver}
    <FormField title="Stream to*">
      <InputStreamReceiver
        bind:value={$context.recipientInputValue}
        on:validationChange={onRecipientInputValidationChange}
      />
    </FormField>
  {/if}
  <FormField title="Token*">
    <div class="list-container">
      <ListSelect
        bind:selected={$context.selectedTokenAddress}
        items={tokenList}
        searchable={Object.keys(tokenList).length > 5}
        emptyStateText={`No tokens available to stream. Add one first by clicking "Add funds" from your Account page.`}
        type="tokens"
      />
    </div>
  </FormField>
  <div class="form-row">
    <FormField title="Stream rate*">
      <TextInput
        suffix={selectedToken?.info.symbol}
        bind:value={$context.amountValue}
        variant={{ type: 'number', min: 0 }}
        placeholder="Amount"
        validationState={amountValidationState}
      />
    </FormField>
    <FormField title="Amount per*">
      <Dropdown
        bind:value={$context.selectedMultiplier}
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
  <Toggleable bind:toggled={$context.setStartAndEndDate} label="Specify start and end dates">
    <div class="start-end-date">
      <p>
        Be aware that if your transaction is confirmed after the configured start date, your stream
        will only start streaming the second it is confirmed on-chain.
      </p>
      <div class="form-row">
        <FormField title="Start date*">
          <TextInput
            validationState={streamStartDateValidationState}
            placeholder="YYYY-MM-DD"
            bind:value={$context.streamStartDateValue}
          />
        </FormField>
        <FormField title="Start time (UTC, 24-hour)* ">
          <TextInput
            validationState={streamStartTimeValidationState}
            placeholder="HH:MM:SS"
            bind:value={$context.streamStartTimeValue}
          />
        </FormField>
      </div>
      <div class="form-row">
        <FormField title="End date*">
          <TextInput
            validationState={streamEndDateValidationState}
            placeholder="YYYY-MM-DD"
            bind:value={$context.streamEndDateValue}
          />
        </FormField>
        <FormField title="End time (UTC, 24-hour)*">
          <TextInput
            validationState={streamEndTimeValidationState}
            placeholder="HH:MM:SS"
            bind:value={$context.streamEndTimeValue}
          />
        </FormField>
      </div>
    </div>
  </Toggleable>
  <SafeAppDisclaimer disclaimerType="drips" />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button variant="primary" on:click={submit} disabled={!formValid}>Create stream</Button>
  </svelte:fragment>
</StepLayout>

<style>
  .form-row {
    display: flex;
    gap: 1rem;
  }

  .list-container {
    max-height: 24rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: scroll;
  }

  p {
    color: var(--color-foreground-level-5);
    text-align: left;
  }

  .start-end-date {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
