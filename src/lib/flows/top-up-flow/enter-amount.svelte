<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import tokens from '$lib/stores/tokens';
  import { ethers } from 'ethers';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import type { TopUpFlowState } from './top-up-flow-state';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import unreachable from '$lib/utils/unreachable';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import Token from '$lib/components/token/token.svelte';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import { formatUnits } from 'ethers/lib/utils';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';
  import topUp from './methods/top-up';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<TopUpFlowState>;

  $: tokenAddress = $context.tokenAddress;
  $: tokenInfo = tokenAddress ? tokens.getByAddress(tokenAddress) ?? unreachable() : unreachable();

  const restorer = $context.restorer;

  let amountValue = restorer.restore('amountValue');

  let validationState: TextInputValidationState = {
    type: 'unvalidated',
  };

  let topUpMax = restorer.restore('topUpMax');
  $: if (topUpMax) {
    amountValue = formatUnits($context.tokenBalance ?? 0n, tokenInfo.info.decimals);
  }

  let amount: bigint | undefined = undefined;
  $: {
    if (!tokenInfo?.info || isNaN(Number(amountValue))) {
      throw new Error('Unable to get token info');
    }

    amount = amountValue ? parseTokenAmount(amountValue, tokenInfo.info.decimals) : undefined;

    const { tokenBalance } = $context;

    if (topUpMax && amount && amount > 0n) {
      validationState = { type: 'valid' };
    } else if (amount) {
      if (tokenBalance && amount <= tokenBalance) {
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
    } else if (amountValue && amount === undefined) {
      validationState = { type: 'invalid', message: 'Invalid value.' };
    } else {
      validationState = { type: 'unvalidated' };
    }
  }

  function submit() {
    if (!amount) return;

    const { tokenBalance, tokenAllowance } = $context;

    const amountToTopUp = topUpMax ? tokenBalance : amount;

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

  $: restorer.saveAll({ amountValue, topUpMax });
</script>

<StepLayout>
  <EmojiAndToken emoji="💰" tokenAddress={tokenInfo.info.address} animateTokenOnMount />
  <StepHeader
    headline={`Add ${tokenInfo?.info.symbol ?? ''} funds`}
    description="Add funds to your Drips account's outgoing balance."
  />
  <FormField title="Wallet Balance">
    <div class="balance">
      <ListSelect
        blockInteraction
        searchable={false}
        items={{
          '': {
            type: 'selectable',
            label: tokenInfo.info.name ?? 'Unknown token',
            text: `${formatTokenAmount(
              {
                tokenAddress: tokenAddress ?? unreachable(),
                amount: $context.tokenBalance ?? unreachable(),
              },
              tokenInfo.info.decimals,
              1n,
            )} ${tokenInfo.info.symbol}`,
            image: {
              component: Token,
              props: {
                address: tokenAddress,
                show: 'none',
                size: 'small',
              },
            },
          },
        }}
      />
    </div>
  </FormField>
  <FormField title="Amount">
    <TextInput
      bind:value={amountValue}
      {validationState}
      variant={{ type: 'number', min: 0 }}
      suffix={tokenInfo?.info.symbol}
      disabled={topUpMax}
    />
    <svelte:fragment slot="toggle">
      <Toggle bind:checked={topUpMax} label="Max" />
    </svelte:fragment>
  </FormField>
  <SafeAppDisclaimer disclaimerType="drips" />
  <svelte:fragment slot="actions">
    <span data-testid="confirm-amount-button">
      <Button variant="primary" on:click={submit} disabled={validationState.type !== 'valid'}
        >Add {tokenInfo?.info.symbol ?? ''}</Button
      >
    </span>
  </svelte:fragment>
</StepLayout>

<style>
  .balance {
    border: 1px solid var(--color-foreground);
    border-radius: 2rem 0 2rem 2rem;
  }
</style>
