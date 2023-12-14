<script lang="ts">
  import Download from 'radicle-design-system/icons/Download.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import { tweened } from 'svelte/motion';
  import { quintInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import aggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import FiatEstimateValue from '../aggregate-fiat-estimate/fiat-estimate-value.svelte';
  import fetchBalancesForTokens from '$lib/utils/drips/fetch-balances-for-tokens';
  import relevantTokens from '$lib/utils/drips/relevant-tokens';
  import globalCollectFlowSteps from '$lib/flows/global-collect-flow/global-collect-flow-steps';
  import modal from '$lib/stores/modal';
  import Stepper from '../stepper/stepper.svelte';

  let amountElem: HTMLDivElement;
  let amountElemWidth = tweened(0, { duration: 400, easing: quintInOut });

  $: ownAccountId = $walletStore.dripsAccountId;

  let splittable:
    | {
        tokenAddress: string;
        amount: bigint;
      }[]
    | undefined;

  async function updateSplittable() {
    if (ownAccountId) {
      // This is duplicated from the balances readable, but since that won't be around for long,
      // we're having it re-fetch the balances here again for now.

      const tokens = await relevantTokens('splittable', ownAccountId);
      const splittableRes = await fetchBalancesForTokens('splittable', tokens, ownAccountId);

      splittable = splittableRes.map(({ tokenAddress, splittableAmount }) => ({
        tokenAddress,
        amount: splittableAmount,
      }));
    }
  }

  $: {
    if (ownAccountId) {
      updateSplittable();
    }
  }

  // $: splittable = ownAccountId ? $balancesStore.accounts[ownAccountId].splittable : undefined;
  $: tokenAddresses = splittable?.reduce<string[]>((acc, { tokenAddress }) => {
    if (tokenAddress) {
      acc.push(tokenAddress);
    }
    return acc;
  }, []);

  const fiatEstimatesStarted = fiatEstimates.started;

  $: tokenAddresses && $fiatEstimatesStarted && fiatEstimates.track(tokenAddresses);
  $: priceReadable = tokenAddresses ? fiatEstimates.price(tokenAddresses) : undefined;
  $: amount =
    priceReadable && $priceReadable && splittable
      ? aggregateFiatEstimate(priceReadable, splittable)
      : undefined;

  let amountTransitioning = false;
  let amountToShow: typeof amount;

  $: loading = typeof amount?.fiatEstimateCents !== 'number';

  async function updateAmountToShow() {
    await tick();

    amountTransitioning = true;

    setTimeout(async () => {
      amountToShow = amount;
      await tick();

      const shouldHide =
        loading ||
        amountToShow?.fiatEstimateCents === 0 ||
        amountToShow?.includesUnknownPrice === true;
      const newWidth = shouldHide ? 0 : amountElem?.getBoundingClientRect().width ?? 0;

      if (newWidth === 24) {
        amountElemWidth.set(0);
      } else {
        amountElemWidth.set(newWidth);
      }
    }, 200);

    setTimeout(() => {
      amountTransitioning = false;
    }, 500);
  }

  $: {
    amount;
    loading;
    if (browser) {
      updateAmountToShow();
    }
  }

  $: nothingToCollect = amountToShow?.fiatEstimateCents === 0;

  function handleClick() {
    if (!splittable) return;

    modal.show(Stepper, undefined, globalCollectFlowSteps(splittable));
  }
</script>

<button on:click={handleClick} disabled={loading} class:nothing-to-collect={nothingToCollect}>
  <div class="amount-wrapper" style:width="{$amountElemWidth}px">
    <div
      class="amount tabular-nums typo-text-bold"
      class:transitioning={amountTransitioning}
      bind:this={amountElem}
    >
      {#if amountToShow}
        <FiatEstimateValue fiatEstimateCents={amountToShow.fiatEstimateCents} />
      {/if}
    </div>
  </div>
  <div class="content">
    {#if loading}
      <div transition:fade class="loading-state">
        <Spinner />
      </div>
    {/if}
    <Download style="fill: var(--color-foreground)" />
    Collect funds
  </div>
</button>

<style>
  button {
    display: flex;
    justify-content: center;
    height: 2rem;
    padding: 0;
    box-shadow: var(--elevation-low);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
    transition: background-color 0.3s, color 0.3s, transform 0.2s, box-shadow 0.2s, opacity 0.3s;
  }

  button.nothing-to-collect {
    opacity: 0.5;
  }

  button .content {
    display: flex;
    gap: 0.25rem;
    justify-content: center;
    padding: 0.25rem 0.75rem 0.25rem 0.5rem;
    position: relative;
    background-color: var(--color-background);
  }

  button .amount-wrapper {
    height: 100%;
    background-color: var(--color-primary);
  }

  button .amount-wrapper .amount {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 0.75rem;
    color: white;
    width: fit-content;
    transition: opacity 0.2s;
  }

  button .amount.transitioning {
    opacity: 0;
  }

  button .content .loading-state {
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-background);
    top: 0;
    left: 0;
  }

  button:disabled {
    opacity: 0.5;
  }

  button:not(:disabled):hover,
  button:not(:disabled):focus-visible {
    box-shadow: 0px 0px 0px 1px var(--color-foreground), 0 2px 0px 1px var(--color-foreground),
      inset 0 0px 0px 0px var(--color-foreground);
    transform: translateY(-2px);
    opacity: 1;
  }

  button:not(:disabled):active {
    transform: translateY(0px);
    box-shadow: 0px 0px 0px 1px var(--color-foreground), 0 0px 0px 0px var(--color-foreground);
  }
</style>
