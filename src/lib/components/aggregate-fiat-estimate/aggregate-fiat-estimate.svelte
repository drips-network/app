<script lang="ts">
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import { fade } from 'svelte/transition';
  import WarningIcon from 'radicle-design-system/icons/ExclamationCircle.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import FiatEstimateValue from './fiat-estimate-value.svelte';
  import aggregateFiatEstimate from './aggregate-fiat-estimate';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ loaded: never }>();
  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  type Amounts = Amount[];

  /** If undefined, component will display a loading state. */
  export let amounts: Amounts | undefined;
  $: tokenAddresses = amounts?.map((a) => a.tokenAddress);

  export let supressUnknownAmountsWarning = false;

  const fiatEstimatesStarted = fiatEstimates.started;
  $: {
    if ($fiatEstimatesStarted && tokenAddresses && tokenAddresses.length > 0) {
      fiatEstimates.track(tokenAddresses);
    }
  }

  $: priceStore = fiatEstimates.price(tokenAddresses ?? []);

  let fiatEstimateCents: number | 'pending' = 'pending';
  let includesUnknownPrice = false;

  const connected = tokensStore.connected;

  $: {
    if ($connected && amounts && $connected) {
      $priceStore;
      const result = aggregateFiatEstimate(priceStore, amounts);

      includesUnknownPrice = result.includesUnknownPrice;
      if (fiatEstimateCents === 'pending' && typeof result.fiatEstimateCents === 'number') {
        dispatch('loaded');
      }
      fiatEstimateCents = result.fiatEstimateCents;
    }
  }
</script>

<div class="aggregate-fiat-estimate">
  <FiatEstimateValue forceLoading={amounts === undefined} {fiatEstimateCents} />
  {#if includesUnknownPrice && fiatEstimateCents !== 'pending' && !supressUnknownAmountsWarning}
    <div class="warning" transition:fade|local={{ duration: 100 }}>
      <Tooltip>
        <WarningIcon />
        <svelte:fragment slot="tooltip-content">
          This amount includes unknown tokens for which we couldnʼt determine a current USD value.
        </svelte:fragment>
      </Tooltip>
    </div>
  {/if}
</div>

<style>
  .aggregate-fiat-estimate {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .warning {
    display: inline-block;
  }
</style>
