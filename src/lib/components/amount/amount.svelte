<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import { utils } from 'ethers';

  export let amount: bigint;
  export let tokenAddress: string;

  export let delta: 'positive' | 'negative' | undefined = undefined;

  $: tokenInfo = $tokens ? tokens.getByAddress(tokenAddress) : undefined;

  function format(amount: bigint, decimals: number) {
    return `${parseFloat(utils.formatUnits(amount, decimals)).toFixed(4)}`;
  }
</script>

{#if tokenInfo}
  <span
    class="amount-wrapper typo-text-mono-bold"
    class:positive={delta === 'positive'}
    class:negative={delta === 'negative'}
  >
    <span class="amount">
      {delta === 'positive' ? '+' : ''}
      {delta === 'negative' ? '-' : ''}
      {format(amount, tokenInfo.info.decimals)}
    </span>
    <span class="symbol">
      {tokenInfo.info.symbol}
    </span>
  </span>
{:else}
  Unknown token
{/if}

<style>
  .amount-wrapper {
    color: var(--color-foreground-level-6);
  }

  .amount-wrapper.negative {
    color: var(--color-negative);
  }

  .amount-wrapper.positive {
    color: var(--color-positive);
  }
</style>
