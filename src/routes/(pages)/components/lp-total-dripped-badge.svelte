<script lang="ts">
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import tickStore from '$lib/stores/tick/tick.store';
  import type { Prices } from '$lib/utils/fiat-estimates/fiat-estimates';
  import totalDrippedApproximation from '$lib/utils/total-dripped-approx';
  import { onDestroy, onMount } from 'svelte';

  let tickHandle: number;

  export let prices: Prices;

  let amounts = totalDrippedApproximation();

  function update() {
    amounts = totalDrippedApproximation();
  }

  onMount(async () => {
    tickStore.start();
    tickHandle = tickStore.register(update);
  });

  onDestroy(() => {
    tickStore.deregister(tickHandle);
  });
</script>

<a
  href="/app"
  class="lp-total-dripped-badge flex items-center px-[0.8em] bg-primary-level-1 text-primary transition duration-300 pointer-events-auto"
>
  <Spinner classes="w-[1.125em] h-[1.125em]" />
  <div class="whitespace-nowrap pl-[0.3em]">
    <span class="font-bold">
      <AggregateFiatEstimate {amounts} {prices} />
    </span> dripped
  </div>
</a>

<style>
  .lp-total-dripped-badge {
    font-size: min(20px, calc(20 / 500 * 100vw));
    height: 2.375em;
    line-height: 1.2;
    border-radius: calc(96 / 40 * 1em) 0 calc(96 / 40 * 1em) calc(96 / 40 * 1em);
    box-shadow:
      0px 0px 0px 1px currentColor,
      0 4px 0px 1px currentColor;
  }

  @media (hover: hover) {
    .lp-total-dripped-badge:hover {
      box-shadow:
        0px 0px 0px 1px currentColor,
        0 8px 0px 1px currentColor;
      transform: translateY(-4px);
    }
  }

  @media (min-width: 1280px) {
    .lp-total-dripped-badge {
      font-size: 20px;
    }
  }
</style>
