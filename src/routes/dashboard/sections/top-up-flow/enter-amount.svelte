<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import tokens from '$lib/stores/tokens';
  import { ethers } from 'ethers';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import type { TopUpFlowState } from './top-up-flow-state';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';

  // TODO: Get current balance of ERC-20, validate input accordingly

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  $: tokenAddress = $context.tokenAddress;
  $: tokenInfo = tokenAddress ? tokens.getByAddress(tokenAddress) : undefined;

  let amountValue = '0';
  let validationState: TextInputValidationState = {
    type: 'unvalidated',
  };

  let amount: bigint | undefined = undefined;
  $: {
    if (!tokenInfo?.info || isNaN(Number(amountValue))) {
      throw new Error('Unable to get token info');
    }

    amount = amountValue
      ? ethers.utils.parseUnits(amountValue, tokenInfo.info.decimals).toBigInt()
      : undefined;

    const { tokenBalance } = $context;

    if (amount) {
      if (tokenBalance && amount < tokenBalance) {
        validationState = { type: 'valid' };
      } else {
        validationState = {
          type: 'invalid',
          message: `You only have ${ethers.utils.formatUnits(
            tokenBalance ?? 0n,
            tokenInfo.info.decimals,
          )} ${tokenInfo.info.symbol} in your wallet.`,
        };
      }
    } else {
      validationState = { type: 'unvalidated' };
    }
  }

  function submit() {
    if (!amount) return;
    const { tokenAllowance } = $context;

    context.update((c) => ({
      ...c,
      amountToTopUp: amount,
    }));

    if (tokenAllowance && tokenAllowance >= amount) {
      // Skip the approve step
      dispatch('goForward', {
        by: 2,
      });
    } else {
      dispatch('goForward');
    }
  }
</script>

<StepLayout>
  <StepHeader
    emoji="💸"
    headline={`Top up ${tokenInfo?.info.name ?? ''}`}
    description="Add funds to your Drips account in order to start streaming."
  />
  <FormField title="Amount">
    <TextInput
      bind:value={amountValue}
      {validationState}
      variant={{ type: 'number', min: 0 }}
      suffix={tokenInfo?.info.symbol}
    />
  </FormField>
  <svelte:fragment slot="actions">
    <Button on:click={submit} disabled={validationState.type !== 'valid'}
      >Top up {amountValue} {tokenInfo?.info.symbol ?? ''}</Button
    >
  </svelte:fragment>
</StepLayout>
