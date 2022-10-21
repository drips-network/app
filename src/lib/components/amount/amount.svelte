<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import { utils } from 'ethers';

  export let amount: bigint | undefined = undefined;
  export let tokenAddress: string;
  export let amountPerSecond: bigint | undefined = undefined;
  export let showSymbol = true;

  $: tokenInfo = $tokens ? tokens.getByAddress(tokenAddress) : undefined;

  let amountPerSecondPolarity: '' | '+' | '-';
  $: {
    if (!amountPerSecond || amountPerSecond === 0n) {
      amountPerSecondPolarity = '';
    } else if (amountPerSecond > 0) {
      amountPerSecondPolarity = '+';
    } else {
      amountPerSecondPolarity = '-';
    }
  }

  function countDecimals(num: number) {
    if (isNaN(+num)) return 0;
    const decimals = (num + '').split('.')[1];
    if (decimals) return decimals.length;
    return 0;
  }

  function format(amount: bigint, decimals: number) {
    const MAX_DECIMALS = 8;
    const MIN_DECIMALS = 2;

    const parsed = Math.abs(parseFloat(utils.formatUnits(amount, decimals)));
    const decimalCount = countDecimals(parsed);

    return `${parsed.toFixed(Math.max(Math.min(MAX_DECIMALS, decimalCount), MIN_DECIMALS))}`;
  }
</script>

{#if tokenInfo}
  <div class="wrapper">
    {#if amount !== undefined}
      <div class="amount">
        <span class="amount-wrapper typo-text-mono-bold">
          <span class="amount">
            {format(amount, tokenInfo.info.decimals)}
          </span>
          {#if showSymbol}
            <span class="symbol">
              {tokenInfo.info.symbol}
            </span>
          {/if}
        </span>
      </div>
    {/if}
    {#if amountPerSecond !== undefined}
      <div class="amount-per-second typo-text-small">
        <span
          class="amount typo-text-small-mono"
          class:positive={amountPerSecondPolarity === '+'}
          class:negative={amountPerSecondPolarity === '-'}
          >{amountPerSecondPolarity}{format(
            amountPerSecond,
            tokenInfo.info.decimals,
          )}{#if showSymbol}
            {' ' + tokenInfo.info.symbol}
          {/if}</span
        > / sec
      </div>
    {/if}
  </div>
{:else}
  Unknown token
{/if}

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
