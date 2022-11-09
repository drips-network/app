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

  $: amountTokenInfo = $tokens && amount ? tokens.getByAddress(amount.tokenAddress) : undefined;
  $: amountPerSecondTokenInfo =
    $tokens && amountPerSecond ? tokens.getByAddress(amountPerSecond.tokenAddress) : undefined;

  function format(amount: Amount) {
    const tokenDecimals = tokens.getByAddress(amount.tokenAddress)?.info.decimals;
    assert(tokenDecimals, `Unable to determine decimals for tokenAddress ${amount.tokenAddress}`);

    return formatTokenAmount(amount, tokenDecimals, multiplier);
  }
</script>

<div class="wrapper">
  {#if amount !== undefined}
    {#if amountTokenInfo}
      <div class="amount">
        <span class="amount-wrapper typo-text-mono-bold">
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
      <div class="amount-per-second typo-text-small">
        <span
          class="amount typo-text-small-mono"
          class:positive={amountPerSecond.amount > 0}
          class:negative={amountPerSecond.amount < 0}
          >{format(amountPerSecond)}{#if showSymbol}
            {' ' + amountPerSecondTokenInfo.info.symbol}
          {/if}</span
        > / sec
      </div>
    {/if}
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
  }
  .amount-wrapper {
    color: var(--color-foreground-level-6);
  }

  .negative {
    color: var(--color-negative);
  }

  .positive {
    color: var(--color-positive);
  }

  .amount-per-second {
    color: var(--color-foreground-level-5);
  }
</style>
