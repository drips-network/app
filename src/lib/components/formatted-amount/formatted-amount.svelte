<script lang="ts">
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import contractConstants from '$lib/utils/sdk/utils/contract-constants';

  export let amount = 0n;
  export let decimals: number;
  export let multiplier = BigInt(contractConstants.AMT_PER_SEC_MULTIPLIER);
  export let preserveTrailingZeroes = true;
</script>

<span>{formatTokenAmount(amount, decimals, multiplier, preserveTrailingZeroes)}</span>

<style>
  span {
    user-select: none;
  }
</style>
