<script lang="ts">
  import { run } from 'svelte/legacy';

  import tokens from '$lib/stores/tokens';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import FormField from '../form-field/form-field.svelte';
  import TextInput from '../text-input/text-input.svelte';
  import Toggle from '../toggle/toggle.svelte';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import Token from '../token/token.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import { formatUnits } from 'ethers';

  interface Props {
    tokenAddress: string | undefined;
    tokenBalance: bigint | undefined;
    loading?: boolean;
    inputValue: string;
    validationState?: TextInputValidationState;
    topUpMax?: boolean;
    amount?: bigint | undefined;
  }

  let {
    tokenAddress,
    tokenBalance,
    loading = false,
    inputValue = $bindable(),
    validationState = $bindable({
      type: 'unvalidated',
    }),
    topUpMax = $bindable(false),
    amount = $bindable(),
  }: Props = $props();
  let tokenInfo = $derived(tokenAddress ? tokens.getByAddress(tokenAddress) : undefined);
  run(() => {
    if (topUpMax && tokenInfo) {
      inputValue = formatUnits(tokenBalance ?? 0n, tokenInfo.info.decimals);
    }
  });
  run(() => {
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
  });
</script>

<FormField title="Wallet balance">
  <div
    class="rounded-drip-xl shadow-low bg-foreground-level-1 flex items-center h-12 gap-2 px-3 typo-text"
  >
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
  {#snippet action()}
    <Toggle bind:checked={topUpMax} label="Max" />
  {/snippet}
</FormField>
