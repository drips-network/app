<script lang="ts">
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import balances from '$lib/stores/balances';
  import tokens from '$lib/stores/tokens';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import Button from '$lib/components/button/button.svelte';
  import streams from '$lib/stores/streams';
  import { constants } from 'radicle-drips';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents, UpdateAwaitStepFn } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import wallet from '$lib/stores/wallet';
  import StreamVisual from '$lib/components/stream-visual/stream-visual.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import Token from '$lib/components/token/token.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import InputAddress from '$lib/components/input-address/input-address.svelte';
  import Toggleable from '$lib/components/toggleable/toggleable.svelte';
  import createStream from './methods/create-stream';
  import { get } from 'svelte/store';
  import unreachable from '$lib/utils/unreachable';
  import parseDate from './methods/parse-date';
  import parseTime from './methods/parse-time';
  import combineDateAndTime from './methods/combine-date-and-time';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import { validateAmtPerSecInput } from '$lib/utils/validate-amt-per-sec';

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
    mapFilterUndefined($balances.streamable, (amount) => {
      const token = tokens.getByAddress(amount.tokenAddress);
      if (!token) return undefined;

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

  let selectedTokenAddress: string[] = tokenList ? [Object.keys(tokenList)[0]] : [];
  onMount(() => {
    const firstToken = Object.keys(tokenList ?? {})[0];

    if (firstToken) selectedTokenAddress = [firstToken];
  });

  $: selectedToken =
    selectedTokenAddress.length === 1 ? tokens.getByAddress(selectedTokenAddress[0]) : undefined;

  // Amount input

  let amountValue: string | undefined;
  $: amountValueParsed =
    amountValue && selectedToken
      ? parseTokenAmount(
          amountValue,
          selectedToken?.info.decimals + constants.AMT_PER_SEC_EXTRA_DECIMALS,
        )
      : undefined;

  // Multiplier dropdown

  let selectedMultiplier = '1';

  // Amount per second

  $: amountPerSecond =
    amountValueParsed && selectedMultiplier && selectedToken
      ? amountValueParsed / BigInt(selectedMultiplier)
      : undefined;

  $: amountValidationState = validateAmtPerSecInput(amountPerSecond);

  let setStartAndEndDate = false;

  // Stream start date
  let streamStartDateValue: string;
  $: streamStartDate = parseDate(streamStartDateValue).date;
  $: streamStartDateValidationState = parseDate(streamStartDateValue).validationState;

  // Stream start time
  let streamStartTimeValue: string;
  $: streamStartTime = parseTime(streamStartTimeValue).time;
  $: streamStartTimeValidationState = parseTime(streamStartTimeValue).validationState;

  // Stream end date
  let streamEndDateValue: string;
  $: streamEndDate = parseDate(streamEndDateValue).date;
  $: streamEndDateValidationState = parseDate(streamEndDateValue).validationState;

  // Stream end time
  let streamEndTimeValue: string;
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
    recipientAddressValidationState.type === 'valid' &&
    amountValidationState?.type === 'valid' &&
    streamNameValue &&
    timeRangeValid;

  function submit() {
    dispatch('await', {
      message: 'Preparing to create the stream...',
      promise: async (updateAwaitStep: UpdateAwaitStepFn) => {
        modal.setHideable(false);

        await createStream(
          updateAwaitStep,
          selectedToken ?? unreachable(),
          amountPerSecond ?? unreachable(),
          recipientAddressValue,
          streamNameValue,
          $streams.accounts[get(wallet).dripsUserId ?? unreachable()],
          setStartAndEndDate
            ? {
                start: combinedStartDate ?? unreachable(),
                end: combinedEndDate ?? unreachable(),
              }
            : undefined,
        );

        modal.setHideable(true);
      },
    });
  }
</script>

<StepLayout>
  <StreamVisual
    disableLinks
    fromAddress={$wallet.address}
    toAddress={recipientAddressValue}
    amountPerSecond={amountValidationState?.type === 'valid' ? amountPerSecond : undefined}
  />
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
        emptyStateText={'No tokens available to stream. Add one first by clicking "Add funds" on your Dashboard.'}
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
  <Toggleable bind:toggled={setStartAndEndDate} label="Specify start- and end dates">
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
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')}>Cancel</Button>
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
