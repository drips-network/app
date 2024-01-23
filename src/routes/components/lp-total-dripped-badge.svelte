<script lang="ts">
  import type { Amount } from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import tokens from '$lib/stores/tokens';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import { onMount } from 'svelte';

  let now = new Date().getTime();
  let visible = false;

  const streams = [
    // Radworks USDC
    {
      token: {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
      started: new Date('September 4, 2023, 12:50 AM').getTime(),
      amtPerSec: '15854895991882',
    },
    // Radworks RAD
    {
      token: {
        address: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
      },
      started: new Date('September 4, 2023, 12:50 AM').getTime(),
      amtPerSec: '11832001522070015220700152',
    },
    // Octant WETH
    // https://drips.network/app/174487241669176381847575438324427367088538936996/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/streams/3580043985
    // {
    //   token: {
    //     address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //   },
    //   started: new Date('January 20, 2024, 5:26 PM').getTime(),
    //   amtPerSec: '1699845679012345679012',
    // }
  ];

  const gives: Amount[] = [
    // Octant https://drips.network/app/drip-lists/30178668158349445547603108732480118476541651095408979232800331391215
    {
      tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: BigInt('9380000000000000000'),
    },
  ];

  let amounts: Amount[] = [];

  $: {
    if (tokens.connected) {
      const streamedAmoutns = streams.map((stream) => {
        const duration = (now - stream.started) / 1000;
        return {
          tokenAddress: stream.token.address,
          amount: BigInt(Math.floor(Number(BigInt(stream.amtPerSec) / BigInt(1e9)) * duration)),
        };
      });
      amounts = [...gives, ...streamedAmoutns];
    }
  }

  let anim = 0;
  function step() {
    now = new Date().getTime();
    anim = requestAnimationFrame(step);
  }

  onMount(async () => {
    tokens.connect(1);
    fiatEstimates.start();
    step();
  });
</script>

<svelte:window on:blur={() => cancelAnimationFrame(anim)} on:focus={step} />

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
