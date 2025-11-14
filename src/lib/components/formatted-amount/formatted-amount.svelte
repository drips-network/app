<script lang="ts">
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import contractConstants from '$lib/utils/sdk/utils/contract-constants';

  interface Props {
    amount?: any;
    decimals: number;
    multiplier?: any;
    preserveTrailingZeroes?: boolean;
  }

  let {
    amount = 0n,
    decimals,
    multiplier = BigInt(contractConstants.AMT_PER_SEC_MULTIPLIER),
    preserveTrailingZeroes = true
  }: Props = $props();
</script>

<span>{formatTokenAmount(amount, decimals, multiplier, preserveTrailingZeroes)}</span>

<style>
  span {
    user-select: none;
  }
</style>
