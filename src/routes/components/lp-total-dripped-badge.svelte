<script lang="ts">
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import tickStore from '$lib/stores/tick/tick.store';
  import tokens from '$lib/stores/tokens';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import totalDrippedApproximation from '$lib/utils/total-dripped-approx';
  import { onDestroy, onMount } from 'svelte';

  let visible = false;

  let tickHandle: number;

  let amounts: ReturnType<typeof totalDrippedApproximation>;
  function update() {
    amounts = totalDrippedApproximation();
  }
  update();

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
  class="rounded-drip-lg flex items-center gap-2 bg-primary-level-1 text-primary px-3 h-8 typo-text transition duration-300"
  class:opacity-0={!visible}
  class:pointer-events-none={!visible}
>
  <Spinner classes="w-3.5 h-3.5" />
  <div>
    <span class="typo-text-bold">
      <AggregateFiatEstimate
        {amounts}
        on:loaded={() => {
          visible = true;
        }}
      />
    </span> dripped
  </div>
</div>
