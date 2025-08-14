<script lang="ts">
  export let forceLoading = false;
  export let fiatEstimateCents: number | 'pending' | 'unsupported' | undefined = 'pending';
  export let compact = false;

  $: formattedFiatEstimate =
    typeof fiatEstimateCents === 'number'
      ? fiatEstimateCents.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          ...(compact && { notation: 'compact', compactDisplay: 'short' }),
        })
      : undefined;
</script>

<div class="tabular-nums">
  {#if forceLoading || fiatEstimateCents === 'pending'}
    <span class="animate-pulse">$...</span>
  {:else if formattedFiatEstimate}
    {formattedFiatEstimate}
  {:else}
    <span aria-label="Unknown amount">??</span>
  {/if}
</div>
