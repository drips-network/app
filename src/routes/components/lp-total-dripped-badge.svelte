<script lang="ts">
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import tickStore from '$lib/stores/tick/tick.store';
  import tokens from '$lib/stores/tokens';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import totalDrippedApproximation from '$lib/utils/total-dripped-approx';
  import { onDestroy, onMount } from 'svelte';

  let tickHandle: number;

  let amounts: ReturnType<typeof totalDrippedApproximation>;
  function update() {
    amounts = totalDrippedApproximation();
  }
  update();

  let textEl: HTMLDivElement;
  let frameEl: HTMLDivElement;
  let animDuration = 1500;

  onMount(async () => {
    tokens.connect(1);
    fiatEstimates.start();
    tickStore.start();

    tickHandle = tickStore.register(update);
  });

  onDestroy(() => {
    tickStore.deregister(tickHandle);
  });
</script>

<div
  class="lp-total-dripped-badge shadow-md flex items-center pl-[0.8em] bg-primary-level-1 text-primary transition duration-300 pointer-events-auto"
>
  <Spinner classes="w-[1.125em] h-[1.125em]" />
  <div
    bind:this={frameEl}
    class="overflow-hidden transition-[max-width] duration-[{animDuration}ms]"
    style="max-width: 0.8em"
  >
    <div bind:this={textEl} class="whitespace-nowrap pl-[0.3em] pr-[0.8em] opacity-0">
      <span class="font-bold">
        <AggregateFiatEstimate
          {amounts}
          on:loaded={async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            const width = frameEl.scrollWidth + 32;
            textEl.style.transform = `translateX(${width}px)`;
            await new Promise((resolve) => setTimeout(resolve, 100));
            frameEl.style.maxWidth = `${width}px`;
            textEl.style.transition = `transform ${animDuration}ms`;
            textEl.style.transform = 'none';
            textEl.style.opacity = '1';
            await new Promise((resolve) => setTimeout(resolve, animDuration * 1.1));
            frameEl.style.maxWidth = 'none';
          }}
        />
      </span> dripped
    </div>
  </div>
</div>

<style>
  .lp-total-dripped-badge {
    font-size: min(24px, calc(24 / 500 * 100vw));
    height: 2.375em;
    line-height: 1.2;
    border-radius: calc(96 / 40 * 1em) 0 calc(96 / 40 * 1em) calc(96 / 40 * 1em);
  }

  @media (min-width: 1280px) {
    .lp-total-dripped-badge {
      font-size: 40px;
    }
  }
</style>
