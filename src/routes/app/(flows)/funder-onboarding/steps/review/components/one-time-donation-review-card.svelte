<script lang="ts">
  import Token from '$lib/components/token/token.svelte';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import unreachable from '$lib/utils/unreachable';
  import tokensStore from '$lib/stores/tokens/tokens.store';

  export let tokenAddress: string;
  export let amount: bigint;

  $: token = tokensStore.getByAddress(tokenAddress);
</script>

<h4>One-Time Donation</h4>
<div class="key-value-row">
  <div class="key-value-pair">
    <h5 class="key">Token</h5>
    <span class="value"><Token address={tokenAddress} size="small" /></span>
  </div>
  <div class="key-value-pair">
    <h5 class="key">Amount</h5>
    <span class="value typo-text tabular-nums"
      >{formatTokenAmount(amount, token?.info.decimals ?? unreachable(), 1n, false)}
      <span class="muted">{token?.info.symbol ?? unreachable()}</span></span
    >
  </div>
</div>

<style>
  h4 {
    margin-bottom: 1rem;
  }

  .key-value-row {
    display: flex;
    gap: 1rem;
  }

  .key-value-row:not(:last-child) {
    margin-bottom: 1rem;
  }

  .key-value-pair {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 50%;
  }

  .key-value-pair h5 {
    color: var(--color-foreground-level-6);
  }

  .muted {
    color: var(--color-foreground-level-6);
  }
</style>
