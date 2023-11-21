<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import FormField from '../form-field/form-field.svelte';
  import TextInput from '../text-input/text-input.svelte';
  import Toggle from '../toggle/toggle.svelte';
  import { formatUnits } from 'ethers/lib/utils';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import Token from '../token/token.svelte';
  import Spinner from '../spinner/spinner.svelte';

  export let tokenAddress: string | undefined;
  export let tokenBalance: bigint | undefined;
  export let loading = false;
  $: tokenInfo = tokenAddress ? tokens.getByAddress(tokenAddress) : undefined;

  export let inputValue: string;

  export let validationState: TextInputValidationState = {
    type: 'unvalidated',
  };

  export let topUpMax = false;

  $: if (topUpMax && tokenInfo) {
    inputValue = formatUnits(tokenBalance ?? 0n, tokenInfo.info.decimals);
  }

  export let amount: bigint | undefined = undefined;
  $: {
    if (tokenBalance === undefined) {
      inputValue = '0';
    }

    if (tokenInfo?.info) {
      amount = inputValue ? parseTokenAmount(inputValue, tokenInfo.info.decimals) : undefined;

      if (topUpMax && amount && amount > 0n) {
        validationState = { type: 'valid' };
      } else if (amount) {
        if (tokenBalance && amount <= tokenBalance) {
          validationState = { type: 'valid' };
        } else {
          validationState = {
            type: 'invalid',
            message: `You only have ${formatUnits(tokenBalance ?? 0n, tokenInfo.info.decimals)} ${
              tokenInfo.info.symbol
            } in your wallet.`,
          };
        }
      } else if (inputValue && amount === undefined) {
        validationState = { type: 'invalid', message: 'Invalid value.' };
      } else {
        validationState = { type: 'unvalidated' };
      }
    } else {
      validationState = { type: 'unvalidated' };
    }
  }
</script>

<FormField title="Wallet balance">
  <div class="rounded-drip-xl bg-foreground-level-1 flex items-center h-12 gap-2 px-3 typo-text">
    {#if tokenAddress && tokenInfo && tokenBalance !== undefined}
      <Token address={tokenAddress} show="none" size="small" />
      <div class="flex-1">
        {tokenInfo.info.name ?? 'Unknown token'}
      </div>
      <div class="text-foreground-level-4 tabular-nums">
        {formatTokenAmount(
          {
            tokenAddress: tokenAddress,
            amount: tokenBalance,
          },
          tokenInfo.info.decimals,
          1n,
        )}
        {tokenInfo.info.symbol}
      </div>
    {:else if loading}
      <Spinner />
    {/if}
  </div>
</FormField>
<FormField title="Amount">
  <TextInput
    bind:value={inputValue}
    {validationState}
    variant={{ type: 'number', min: 0 }}
    suffix={tokenInfo?.info.symbol}
    disabled={topUpMax || !tokenAddress}
  />
  <svelte:fragment slot="action">
    <Toggle bind:checked={topUpMax} label="Max" />
  </svelte:fragment>
</FormField>
