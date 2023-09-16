<script lang="ts">
  export let forceLoading = false;
  export let fiatEstimateCents: number | 'pending' | 'unsupported' | undefined = 'pending';

  $: formattedFiatEstimate =
    typeof fiatEstimateCents === 'number'
      ? fiatEstimateCents.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : undefined;
</script>

<div class="tabular-nums">
  {#if forceLoading || fiatEstimateCents === 'pending'}
    <span class="animate-pulse">$...</span>
  {:else if formattedFiatEstimate}
    <span class="text-foreground-level-5">≈</span>{formattedFiatEstimate}
  {:else}
    <span aria-label="Unknown amount">??</span>
  {/if}
</div>
