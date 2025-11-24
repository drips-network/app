<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import tokens from '$lib/stores/tokens';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import type { TopUpFlowState } from './top-up-flow-state';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import unreachable from '$lib/utils/unreachable';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';
  import topUp from './methods/top-up';
  import InputWalletAmount from '$lib/components/input-wallet-amount/input-wallet-amount.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;
  export let backButton: boolean;

  $: tokenAddress = $context.tokenAddress;
  $: tokenInfo = tokenAddress ? (tokens.getByAddress(tokenAddress) ?? unreachable()) : undefined;

  let amount: bigint | undefined = undefined;

  let validationState: TextInputValidationState = {
    type: 'unvalidated',
  };

  function submit() {
    if (!amount) return;

    const { tokenBalance, tokenAllowance } = $context;

    const amountToTopUp = $context.topUpMax ? tokenBalance : amount;

    context.update((c) => ({
      ...c,
      amountToTopUp,
    }));

    topUp(
      dispatch,
      tokenAddress ?? unreachable(),
      amountToTopUp ?? unreachable(),
      tokenAllowance ?? unreachable(),
    );
  }
</script>

<StepLayout>
  {#if tokenInfo}
    <EmojiAndToken emoji="💰" tokenAddress={tokenInfo.info.address} animateTokenOnMount />
  {/if}
  <StepHeader
    headline={`Add ${tokenInfo?.info.symbol}`}
    description="Add funds to your Drips account's outgoing balance."
  />
  <InputWalletAmount
    tokenAddress={$context.tokenAddress}
    tokenBalance={$context.tokenBalance}
    bind:topUpMax={$context.topUpMax}
    bind:inputValue={$context.amountValue}
    bind:amount
    bind:validationState
  />
  <SafeAppDisclaimer disclaimerType="drips" />
  <svelte:fragment slot="actions">
    {#if backButton}
      <Button
        on:click={() => {
          context.set({
            tokenAddress: undefined,
            amountValue: '',
            topUpMax: false,
          });
          dispatch('goBackward');
        }}
        variant="ghost"
      >
        Back
      </Button>
    {/if}
    <span data-testid="confirm-amount-button">
      <Button variant="primary" on:click={submit} disabled={validationState.type !== 'valid'}
        >Add {tokenInfo?.info.symbol ?? ''}</Button
      >
    </span>
  </svelte:fragment>
</StepLayout>
