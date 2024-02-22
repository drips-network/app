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
  import balances from '$lib/stores/balances';
  import tokens from '$lib/stores/tokens';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import Button from '$lib/components/button/button.svelte';
  import streams from '$lib/stores/streams';
  import { constants } from 'radicle-drips';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import wallet from '$lib/stores/wallet/wallet.store';
  import DripVisual, {
    DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT,
    DRIP_VISUAL_NFT_DRIVER_ACCOUNT_FRAGMENT,
  } from '$lib/components/drip-visual/drip-visual.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import Token from '$lib/components/token/token.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import InputAddress from '$lib/components/input-address/input-address.svelte';
  import Toggleable from '$lib/components/toggleable/toggleable.svelte';
  import createStream from './methods/create-stream';
  import { get, type Writable } from 'svelte/store';
  import unreachable from '$lib/utils/unreachable';
  import parseDate from './methods/parse-date';
  import parseTime from './methods/parse-time';
  import combineDateAndTime from './methods/combine-date-and-time';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import { validateAmtPerSecInput } from '$lib/utils/validate-amt-per-sec';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';
  import type { CreateStreamFlowState } from './create-stream-flow-state';
  import { Driver } from '$lib/graphql/__generated__/base-types';
  import { gql } from 'graphql-request';
  import type {
    CreateStreamFlowAddressDriverAccountFragment,
    CreateStreamFlowDetailsNftDriverAccountFragment,
  } from './__generated__/gql.generated';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<CreateStreamFlowState>;
  export let tokenAddress: string | undefined = undefined;
  export let receiver:
    | CreateStreamFlowDetailsNftDriverAccountFragment
    | CreateStreamFlowAddressDriverAccountFragment
    | undefined = undefined;
  export let nameInputHidden: boolean | undefined = false;

  const restorer = $context.restorer;

  const accountId = $wallet.dripsAccountId ?? unreachable();

  let streamNameValue = restorer.restore('streamNameValue');

  // Recipient Address

  let recipientInputValue = receiver?.accountId ?? restorer.restore('recipientInputValue');
  let recipientInputValidationState: TextInputValidationState = { type: 'unvalidated' };

  function onRecipientInputValidationChange(event: CustomEvent) {
    recipientInputValidationState = event.detail ?? { type: 'unvalidated' };
  }

  // Token dropdown

  let tokenList: Items;
  $: tokenList = Object.fromEntries(
    mapFilterUndefined(
      Object.entries($balances.accounts[accountId].tokens),
      ([tokenAddress, tokenEstimate]) => {
        const remaining = tokenEstimate.total.totals.remainingBalance;

        const token = tokens.getByAddress(tokenAddress);
        if (!token) return undefined;

        return [
          token.info.address.toLowerCase(),
          {
            type: 'selectable',
            searchString: [token.info.name, token.info.symbol],
            label: token.info.name,
            text: `${formatTokenAmount(remaining, token.info.decimals)} ${token.info.symbol}`,
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
      },
    ) ?? [],
  );

  let selectedTokenAddress: string[] =
    restorer.restore('selectedTokenAddress') ??
    (tokenAddress ? [tokenAddress.toLowerCase()] : tokenList ? [Object.keys(tokenList)[0]] : []);

  onMount(() => {
    if (selectedTokenAddress.length !== 0) return;

    const firstToken = Object.keys(tokenList ?? {})[0];
    if (firstToken) selectedTokenAddress = [firstToken];
  });

  $: selectedToken =
    selectedTokenAddress.length === 1 ? tokens.getByAddress(selectedTokenAddress[0]) : undefined;

  // Amount input

  let amountValue: string | undefined = restorer.restore('amountValue');
  $: amountValueParsed =
    amountValue && selectedToken
      ? parseTokenAmount(
          amountValue,
          selectedToken?.info.decimals + constants.AMT_PER_SEC_EXTRA_DECIMALS,
        )
      : undefined;

  // Multiplier dropdown

  let selectedMultiplier = restorer.restore('selectedMultiplier');

  // Amount per second

  $: amountPerSecond =
    amountValueParsed && selectedMultiplier && selectedToken
      ? amountValueParsed / BigInt(selectedMultiplier)
      : undefined;

  $: amountValidationState = validateAmtPerSecInput(amountPerSecond);

  let setStartAndEndDate = restorer.restore('setStartAndEndDate');

  // Stream start date
  let streamStartDateValue = restorer.restore('streamStartDateValue');
  $: streamStartDate = parseDate(streamStartDateValue).date;
  $: streamStartDateValidationState = parseDate(streamStartDateValue).validationState;

  // Stream start time
  let streamStartTimeValue = restorer.restore('streamStartTimeValue');
  $: streamStartTime = parseTime(streamStartTimeValue).time;
  $: streamStartTimeValidationState = parseTime(streamStartTimeValue).validationState;

  // Stream end date
  let streamEndDateValue = restorer.restore('streamEndDateValue');
  $: streamEndDate = parseDate(streamEndDateValue).date;
  $: streamEndDateValidationState = parseDate(streamEndDateValue).validationState;

  // Stream end time
  let streamEndTimeValue = restorer.restore('streamEndTimeValue');
  $: streamEndTime = parseTime(streamEndTimeValue).time;
  $: streamEndTimeValidationState = parseTime(streamEndTimeValue).validationState;

  $: combinedStartDate =
    streamStartDate &&
    streamStartTime &&
    combineDateAndTime(streamStartDate ?? unreachable(), streamStartTime ?? unreachable());

  $: combinedEndDate =
    streamEndDate &&
    streamEndTime &&
    combineDateAndTime(streamEndDate ?? unreachable(), streamEndTime ?? unreachable());

  $: timeRangeValid =
    !setStartAndEndDate ||
    (combinedStartDate &&
      combinedEndDate &&
      combinedStartDate?.getTime() < combinedEndDate?.getTime());

  $: formValid =
    streamEndDateValidationState.type !== 'invalid' &&
    (receiver || recipientInputValidationState.type === 'valid') &&
    amountValidationState?.type === 'valid' &&
    (nameInputHidden || streamNameValue) &&
    timeRangeValid;

  function submit() {
    createStream(
      dispatch,
      selectedToken ?? unreachable(),
      amountPerSecond ?? unreachable(),
      recipientInputValue ?? unreachable(),
      streamNameValue,
      $streams.accounts[get(wallet).dripsAccountId ?? unreachable()],
      setStartAndEndDate
        ? {
            start: combinedStartDate ?? unreachable(),
            end: combinedEndDate ?? unreachable(),
          }
        : undefined,
    );
  }

  $: restorer.saveAll({
    streamNameValue,
    amountValue,
    selectedTokenAddress,
    selectedMultiplier,
    recipientInputValue,
    streamStartDateValue,
    streamStartTimeValue,
    streamEndDateValue,
    streamEndTimeValue,
    setStartAndEndDate,
  });
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
    to={receiver
      ? receiver
      : recipientInputValidationState.type === 'valid' && recipientInputValue
      ? {
          __typename: 'AddressDriverAccount',
          driver: Driver.Address,
          address: recipientInputValue,
        }
      : undefined}
    amountPerSecond={amountValidationState?.type === 'valid' ? amountPerSecond : undefined}
  />
  <StepHeader
    headline={receiver ? 'Create a Support Stream' : 'Create stream'}
    description="Stream any ERC-20 token from your Drips account."
  />
  {#if !nameInputHidden}
    <FormField title="Stream name*">
      <TextInput bind:value={streamNameValue} placeholder="Enter any name" />
    </FormField>
  {/if}
  {#if !receiver}
    <FormField title="Stream to*">
      <InputAddress
        bind:value={recipientInputValue}
        on:validationChange={onRecipientInputValidationChange}
      />
    </FormField>
  {/if}
  <FormField title="Token*">
    <div class="list-container">
      <ListSelect
        bind:selected={selectedTokenAddress}
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
        bind:value={amountValue}
        variant={{ type: 'number', min: 0 }}
        placeholder="Amount"
        validationState={amountValidationState}
      />
    </FormField>
    <FormField title="Amount per*">
      <Dropdown
        bind:value={selectedMultiplier}
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
  <Toggleable bind:toggled={setStartAndEndDate} label="Specify start and end dates">
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
            bind:value={streamStartDateValue}
          />
        </FormField>
        <FormField title="Start time (UTC, 24-hour)* ">
          <TextInput
            validationState={streamStartTimeValidationState}
            placeholder="HH:MM:SS"
            bind:value={streamStartTimeValue}
          />
        </FormField>
      </div>
      <div class="form-row">
        <FormField title="End date*">
          <TextInput
            validationState={streamEndDateValidationState}
            placeholder="YYYY-MM-DD"
            bind:value={streamEndDateValue}
          />
        </FormField>
        <FormField title="End time (UTC, 24-hour)*">
          <TextInput
            validationState={streamEndTimeValidationState}
            placeholder="HH:MM:SS"
            bind:value={streamEndTimeValue}
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
