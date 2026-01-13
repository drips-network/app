<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import FormField from '../form-field/form-field.svelte';
  import TextInput from '../text-input/text-input.svelte';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import Token from '../token/token.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import { formatUnits } from 'ethers';
  import Button from '../button/button.svelte';

  interface Props {
    tokenAddress: string | undefined;
    tokenBalance: bigint | undefined;
    loading?: boolean;
    validationState?: TextInputValidationState;
    amount?: bigint | undefined;
    displayTokenLabel?: string;
    displayTokenSymbol?: string;
    balanceSymbol?: string;

    onamountchange?: (value: bigint | undefined) => void;
  }

  let {
    tokenAddress,
    tokenBalance,
    loading = false,
    validationState = $bindable({
      type: 'unvalidated',
    }),
    amount,
    displayTokenLabel,
    displayTokenSymbol,
    balanceSymbol,

    onamountchange,
  }: Props = $props();
  let tokenInfo = $derived(tokenAddress ? tokens.getByAddress(tokenAddress) : undefined);
  const shownName = $derived(displayTokenLabel ?? tokenInfo?.info.name ?? 'Unknown token');
  const shownSymbol = $derived(displayTokenSymbol ?? tokenInfo?.info.symbol);
  const shownBalanceSymbol = $derived(balanceSymbol ?? shownSymbol);

  function setMax() {
    if (tokenInfo) {
      inputValue = formatUnits(tokenBalance ?? 0n, tokenInfo.info.decimals);
    }
  }

  let inputValue = $state<string>('');

  $effect(() => {
    if (tokenBalance === undefined) {
      inputValue = '0';
    }

    if (tokenInfo?.info) {
      amount = inputValue ? parseTokenAmount(inputValue, tokenInfo.info.decimals) : undefined;

      onamountchange?.(amount);

      if (amount) {
        if (tokenBalance && amount <= tokenBalance) {
          validationState = { type: 'valid' };
        } else {
          validationState = {
            type: 'invalid',
            message: `You only have ${formatUnits(tokenBalance ?? 0n, tokenInfo.info.decimals)} ${
              shownBalanceSymbol ?? ''
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
        {shownName}
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
        {shownBalanceSymbol}
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
    suffix={shownSymbol}
    disabled={!tokenAddress}
  />
  {#snippet action()}
    <Button size="small" variant="ghost" onclick={setMax}>Max</Button>
  {/snippet}
</FormField>
