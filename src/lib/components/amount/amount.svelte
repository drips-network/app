<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import { utils } from 'ethers';
  import assert from '$lib/utils/assert';
  import { constants } from 'radicle-drips';

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

  function countDecimals(num: number) {
    if (isNaN(+num)) return 0;
    const decimals = (num + '').split('.')[1];
    if (decimals) return decimals.length;
    return 0;
  }

  function format(amount: Amount) {
    const MAX_DECIMAL_ZEROES = 8;
    const MIN_DECIMAL_ZEROES = 2;

    const tokenDecimals = tokens.getByAddress(amount.tokenAddress)?.info.decimals;
    assert(tokenDecimals, `Unable to determine decimals for tokenAddress ${amount.tokenAddress}`);

    const parsed = Math.abs(
      parseFloat(utils.formatUnits(amount.amount / multiplier, tokenDecimals)),
    );
    const decimalCount = countDecimals(parsed);

    return `${parsed.toFixed(
      Math.max(Math.min(MAX_DECIMAL_ZEROES, decimalCount), MIN_DECIMAL_ZEROES),
    )}`;
  }

  function getPolarity(amount: bigint): '+' | '-' | undefined {
    if (amount > 0) {
      return '+';
    }
    if (amount < 0) {
      return '-';
    }
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
          >{getPolarity(amountPerSecond.amount) ?? ''}{format(amountPerSecond)}{#if showSymbol}
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
