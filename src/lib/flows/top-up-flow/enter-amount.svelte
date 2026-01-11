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

  interface Props {
    context: Writable<TopUpFlowState>;
    backButton: boolean;
  }

  let { context, backButton }: Props = $props();

  let tokenAddress = $derived($context.tokenAddress);
  let tokenInfo = $derived(
    tokenAddress ? (tokens.getByAddress(tokenAddress) ?? unreachable()) : undefined,
  );
  const autoWrapPair = $derived($context.autoWrapPair);
  const displaySymbol = $derived(
    $context.autoWrap
      ? (autoWrapPair?.nativeSymbol ?? tokenInfo?.info.symbol)
      : tokenInfo?.info.symbol,
  );
  const displayLabel = $derived(
    $context.autoWrap ? (autoWrapPair?.name ?? tokenInfo?.info.name) : tokenInfo?.info.name,
  );

  let amount: bigint | undefined = $state(undefined);

  let validationState: TextInputValidationState = $state({
    type: 'unvalidated',
  });

  async function submit() {
    if (!amount) return;

    const { tokenAllowance } = $context;

    context.update((c) => ({
      ...c,
      amount,
    }));

    topUp(
      dispatch,
      tokenAddress ?? unreachable(),
      amount ?? unreachable(),
      tokenAllowance ?? unreachable(),
      Boolean($context.autoWrap),
      $context.autoWrapPair,
    );
  }
</script>

<StepLayout>
  {#if tokenInfo}
    <EmojiAndToken emoji="💰" tokenAddress={tokenInfo.info.address} animateTokenOnMount />
  {/if}
  <StepHeader
    headline={`Add ${displaySymbol ?? ''}`}
    description="Add funds to your Drips account's outgoing balance."
  />
  <InputWalletAmount
    tokenAddress={$context.tokenAddress}
    tokenBalance={$context.tokenBalance}
    displayTokenLabel={displayLabel}
    displayTokenSymbol={displaySymbol}
    balanceSymbol={displaySymbol}
    bind:inputValue={$context.amountValue}
    bind:amount
    bind:validationState
  />
  <SafeAppDisclaimer disclaimerType="drips" />
  {#snippet actions()}
    {#if backButton}
      <Button
        onclick={() => {
          context.set({
            tokenAddress: undefined,
            amountValue: '',
          });
          dispatch('goBackward');
        }}
        variant="ghost"
      >
        Back
      </Button>
    {/if}
    <span data-testid="confirm-amount-button">
      <Button variant="primary" onclick={submit} disabled={validationState.type !== 'valid'}
        >Add {displaySymbol ?? ''}</Button
      >
    </span>
  {/snippet}
</StepLayout>
