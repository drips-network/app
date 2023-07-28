<script lang="ts">
  import { fade } from 'svelte/transition';

  export let fiatEstimateCents: number | 'pending' | 'unsupported' | undefined = 'pending';

  $: formattedFiatEstimate =
    typeof fiatEstimateCents === 'number' ? fiatEstimateCents.toFixed(2) : undefined;
</script>

<div class="wrapper">
  {#if typeof fiatEstimateCents === 'number' && formattedFiatEstimate}
    {#key formattedFiatEstimate}
      <span transition:fade={{ duration: 200 }} class="amount"
        ><span class="currency">≈$</span>{formattedFiatEstimate}</span
      >
    {/key}
    <span class="amount placeholder" aria-hidden="true">≈${formattedFiatEstimate}</span>
  {:else if fiatEstimateCents === 'pending'}
    <span transition:fade={{ duration: 100 }} class="pending"
      ><span class="currency">≈$</span>...</span
    >
    <span class="pending placeholder" aria-hidden="true"><span class="currency">≈$</span>...</span>
  {:else}
    Unknown amount
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    position: relative;
  }

  .amount {
    position: absolute;
    top: 0;
    left: 0;
    font-feature-settings: 'tnum';
  }

  .pending {
    top: 0;
    left: 0;
    position: absolute;
    animation: loading 2s infinite;
  }

  .placeholder {
    position: relative;
    opacity: 0;
    pointer-events: none;
  }

  .currency {
    opacity: 0.5;
  }

  @keyframes loading {
    0% {
      opacity: 0.25;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.25;
    }
  }
</style>
