<script lang="ts">
  import tokensStore, { type TokenInfoWrapper } from '$lib/stores/tokens/tokens.store';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import { fade } from 'svelte/transition';
  import WarningIcon from 'radicle-design-system/icons/ExclamationCircle.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import FiatEstimateValue from './fiat-estimate-value.svelte';

  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  type Amounts = Amount[];

  export let amounts: Amounts;
  $: tokens =
    ($tokensStore &&
      amounts.map((amount) => tokensStore.getByAddress(amount.tokenAddress.toLowerCase()))) ??
    [];
  $: knownTokens = tokens.filter((token): token is TokenInfoWrapper => token !== undefined);
  $: knownSymbols = knownTokens.map((token) => token.info.symbol);

  $: fiatEstimates.track(knownSymbols);

  $: priceStore = fiatEstimates.price(knownSymbols);

  let fiatEstimateCents: number | 'pending' = 'pending';
  let includesUnknownPrice = false;

  const connected = tokensStore.connected;

  $: {
    if ($connected) {
      const prices = $priceStore;

      includesUnknownPrice = false;

      if (Object.values(prices).includes('pending')) {
        fiatEstimateCents = 'pending';
      } else {
        fiatEstimateCents = amounts.reduce((sum, { tokenAddress, amount }) => {
          const res = fiatEstimates.convert({ amount, tokenAddress });

          if (res === 'unsupported') {
            includesUnknownPrice = true;
            return sum;
          }

          if (!res || res === 'pending') {
            return sum;
          }

          return sum + res;
        }, 0);
      }
    }
  }
</script>

<div class="aggregate-fiat-estimate">
  <FiatEstimateValue {fiatEstimateCents} />
  {#if includesUnknownPrice && fiatEstimateCents !== 'pending'}
    <div class="warning" transition:fade|local={{ duration: 100 }}>
      <Tooltip>
        <WarningIcon style="fill: var(--color-negative)" />
        <svelte:fragment slot="tooltip-content">
          This amount includes unknown tokens for which we couldn't determine a current USD value.
        </svelte:fragment>
      </Tooltip>
    </div>
  {/if}
</div>

<style>
  .aggregate-fiat-estimate {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .warning {
    display: inline-block;
  }
</style>
