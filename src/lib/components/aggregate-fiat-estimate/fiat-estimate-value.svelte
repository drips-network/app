<script lang="ts">
  interface Props {
    forceLoading?: boolean;
    fiatEstimateCents?: number | 'pending' | 'unsupported' | undefined;
    compact?: boolean;
  }

  let { forceLoading = false, fiatEstimateCents = 'pending', compact = false }: Props = $props();

  let formattedFiatEstimate = $derived(
    typeof fiatEstimateCents === 'number'
      ? fiatEstimateCents.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          ...(compact && { notation: 'compact', compactDisplay: 'short' }),
        })
      : undefined,
  );
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
