<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import assert from '$lib/utils/assert';
  import { constants } from 'radicle-drips';
  import formatTokenAmount from '$lib/utils/format-token-amount';

  interface Amount {
    amount: bigint;
    tokenAddress: string;
  }

  export let amount: Amount | undefined = undefined;
  export let amountPerSecond: Amount | undefined = undefined;
  export let showSymbol = true;
  export let multiplier = BigInt(constants.AMT_PER_SEC_MULTIPLIER);

  export let amountClasses = 'typo-text-mono-bold';
  export let amountPerSecClasses = 'typo-text-small-mono text-foreground-level-4';

  $: amountTokenInfo = $tokens && amount ? tokens.getByAddress(amount.tokenAddress) : undefined;
  $: amountPerSecondTokenInfo =
    $tokens && amountPerSecond ? tokens.getByAddress(amountPerSecond.tokenAddress) : undefined;

  export function format(amount: Amount) {
    const tokenDecimals = tokens.getByAddress(amount.tokenAddress)?.info.decimals;
    assert(tokenDecimals, `Unable to determine decimals for tokenAddress ${amount.tokenAddress}`);

    return formatTokenAmount(amount, tokenDecimals, multiplier);
  }
</script>

<div class="wrapper">
  {#if amount !== undefined}
    {#if amountTokenInfo}
      <div class="amount">
        <span class="amount-wrapper {amountClasses}">
          <span class="amount">
            {format(amount)}
          </span>
          {#if showSymbol}
            <span class="symbol">
              {amountTokenInfo.info.symbol}
            </span>
          {/if}
        </span>
      </div>
    {:else}
      Unknown token
    {/if}
  {/if}
  {#if amountPerSecond !== undefined}
    {#if amountPerSecondTokenInfo}
      <div class="amount-per-second {amountPerSecClasses}">
        <span
          class="amount"
          class:text-positive={amountPerSecond.amount > 0}
          class:text-negative={amountPerSecond.amount < 0}
          >{amountPerSecond.amount > 0 ? '+' : ''}{format(amountPerSecond)}{#if showSymbol}
            {' ' + amountPerSecondTokenInfo.info.symbol}
          {/if}</span
        >/sec
      </div>
    {/if}
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
  }
</style>
