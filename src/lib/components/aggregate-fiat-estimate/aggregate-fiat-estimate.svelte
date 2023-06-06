<script lang="ts">
  import tokensStore, { type TokenInfoWrapper } from '$lib/stores/tokens/tokens.store';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import { fade } from 'svelte/transition';
  import WarningIcon from 'radicle-design-system/icons/ExclamationCircle.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';

  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  type Amounts = Amount[];

  export let amounts: Amounts;
  $: tokens = amounts.map((amount) => tokensStore.getByAddress(amount.tokenAddress));
  $: includesUnknownTokens = tokens.some((token) => token === undefined);
  $: knownTokens = tokens.filter((token): token is TokenInfoWrapper => token !== undefined);
  $: knownSymbols = knownTokens.map((token) => token.info.symbol);

  $: fiatEstimates.track(knownSymbols);

  $: priceStore = fiatEstimates.price(knownSymbols);

  let fiatEstimateCents: number | 'pending' = 'pending';
  let includesUnknownPrice = false;

  $: {
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

  $: formattedFiatEstimate =
    typeof fiatEstimateCents === 'number' ? (fiatEstimateCents / 100).toFixed(2) : undefined;
</script>

<div class="aggregate-fiat-estimate">
  {#if typeof fiatEstimateCents === 'number'}
    {#key fiatEstimateCents}
      <span transition:fade={{ duration: 100 }} class="amount"
        ><span class="currency">$</span>{formattedFiatEstimate}</span
      >
    {/key}
    <span class="amount placeholder">${formattedFiatEstimate}</span>
  {:else if fiatEstimateCents === 'pending'}
    <span transition:fade={{ duration: 100 }} class="pending"
      ><span class="currency">$</span>...</span
    >
    <span class="pending placeholder"><span class="currency">$</span>...</span>
  {/if}
  {#if includesUnknownPrice && fiatEstimateCents !== 'pending'}
    <div class="warning" transition:fade={{ duration: 100 }}>
      <Tooltip>
        <WarningIcon style="fill: var(--color-negative)" />
        <svelte:fragment slot="tooltip-content">
          This amount includes unknown tokens, for which we cannot determine a current USD price.
          Please refer to the detailed token breakdown.
        </svelte:fragment>
      </Tooltip>
    </div>
  {/if}
</div>

<style>
  .aggregate-fiat-estimate {
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
  }

  .placeholder {
    position: relative;
    opacity: 0;
    pointer-events: none;
  }

  .currency {
    opacity: 0.5;
  }

  .warning {
    display: inline-block;
  }
</style>
