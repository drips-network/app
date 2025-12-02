<script lang="ts">
  import { run } from 'svelte/legacy';

  import fiatEstimates, { type Prices } from '$lib/utils/fiat-estimates/fiat-estimates';
  import { fade } from 'svelte/transition';
  import WarningIcon from '$lib/components/icons/ExclamationCircle.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import FiatEstimateValue from './fiat-estimate-value.svelte';
  import aggregateFiatEstimate from './aggregate-fiat-estimate';
  import { createEventDispatcher } from 'svelte';
  import { readable } from 'svelte/store';

  const dispatch = createEventDispatcher<{ loaded: void }>();
  interface Amount {
    tokenAddress: string;
    amount: bigint | string;
  }

  type Amounts = Amount[];

  const fiatEstimatesStarted = fiatEstimates.started;

  let includesUnknownPrice = $state(false);

  interface Props {
    /** If undefined, component will display a loading state. */
    amounts: Amounts | undefined;
    supressUnknownAmountsWarning?: boolean;
    /**
    Pass prices if they've been fetched externally already (e.g. in a load function).
    If undefined, it will call in and wait for prices from `fiatEstimates` store.

    If you do pass prices, make sure that there's a value for each token address included in `amounts`.
  */
    prices?: Prices | undefined;
    fiatEstimateCents?: number | 'pending';
    compact?: boolean;
  }

  let {
    amounts,
    supressUnknownAmountsWarning = false,
    prices = undefined,
    fiatEstimateCents = $bindable('pending'),
    compact = false,
  }: Props = $props();
  let tokenAddresses = $derived(amounts?.map((a) => a.tokenAddress));
  run(() => {
    if ($fiatEstimatesStarted && tokenAddresses && tokenAddresses.length > 0 && !prices) {
      fiatEstimates.track(tokenAddresses);
    }
  });
  let priceStore = $derived(prices ? readable(prices) : fiatEstimates.price(tokenAddresses ?? []));
  run(() => {
    if (amounts) {
      const result = aggregateFiatEstimate($priceStore, amounts);

      if (fiatEstimateCents === 'pending' && typeof result.fiatEstimateCents === 'number') {
        dispatch('loaded');
      }

      includesUnknownPrice = result.includesUnknownPrice;
      fiatEstimateCents = result.fiatEstimateCents;
    }
  });
</script>

<div class="aggregate-fiat-estimate">
  <FiatEstimateValue
    forceLoading={amounts === undefined && typeof fiatEstimateCents !== 'number'}
    {fiatEstimateCents}
    {compact}
  />
  {#if includesUnknownPrice && fiatEstimateCents !== 'pending' && !supressUnknownAmountsWarning}
    <div class="warning" transition:fade={{ duration: 100 }}>
      <Tooltip>
        <WarningIcon />
        {#snippet tooltip_content()}
          This amount includes unknown tokens for which we couldnʼt determine a current USD value.
        {/snippet}
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
