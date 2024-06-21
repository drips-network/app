<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const COLLECT_BUTTON_WITHDRAWABLE_BALANCE_FRAGMENT = gql`
    fragment CollectButtonWithdrawableBalance on WithdrawableBalance {
      tokenAddress
      collectableAmount
      receivableAmount
      splittableAmount
    }
  `;
</script>

<script lang="ts">
  import Download from '$lib/components/icons/Download.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import { tweened } from 'svelte/motion';
  import { quintInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import aggregateFiatEstimate, {
    aggregateFiatEstimateReadable,
  } from '../aggregate-fiat-estimate/aggregate-fiat-estimate';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import FiatEstimateValue from '../aggregate-fiat-estimate/fiat-estimate-value.svelte';
  import globalCollectFlowSteps from '$lib/flows/global-collect-flow/global-collect-flow-steps';
  import modal from '$lib/stores/modal';
  import Stepper from '../stepper/stepper.svelte';
  import type { CollectButtonWithdrawableBalanceFragment } from './__generated__/gql.generated';
  import tokensStore from '$lib/stores/tokens/tokens.store';

  export let withdrawableBalances: CollectButtonWithdrawableBalanceFragment[];

  /** If true, the collectable amount will only briefly peek on screen when updated, rather than staying forever. */
  export let peekAmount = false;

  /** Bind to this to understand whether the collect button is currently peeking an amount. */
  export let isPeeking = false;

  let amountElem: HTMLDivElement;
  let amountElemWidth = tweened(0, { duration: 400, easing: quintInOut });

  $: tokenAddresses = withdrawableBalances?.reduce<string[]>((acc, { tokenAddress }) => {
    if (tokenAddress) {
      acc.push(tokenAddress);
    }
    return acc;
  }, []);

  const fiatEstimatesStarted = fiatEstimates.started;

  $: amounts = withdrawableBalances.map(
    ({ tokenAddress, splittableAmount, receivableAmount, collectableAmount }) => ({
      tokenAddress,
      amount: BigInt(splittableAmount) + BigInt(receivableAmount) + BigInt(collectableAmount),
    }),
  );

  const tokensConnected = tokensStore.connected;

  $: tokenAddresses && $fiatEstimatesStarted && fiatEstimates.track(tokenAddresses);
  $: priceReadable =
    $fiatEstimatesStarted && tokenAddresses ? fiatEstimates.price(tokenAddresses) : undefined;
  $: amount = $tokensConnected ? aggregateFiatEstimateReadable(priceReadable, amounts) : undefined;

  let amountTransitioning = false;
  let amountToShow: ReturnType<typeof aggregateFiatEstimate> | undefined;

  $: loading = typeof $amount?.fiatEstimateCents !== 'number';

  async function updateAmountToShow(hide = false) {
    await tick();

    const newAmount = $amount;

    if (newAmount?.fiatEstimateCents !== amountToShow?.fiatEstimateCents)
      amountTransitioning = true;

    amountToShow = newAmount;
    await tick();

    const shouldHide =
      hide ||
      loading ||
      amountToShow?.fiatEstimateCents === 0 ||
      amountToShow?.includesUnknownPrice === true;
    const newWidth = shouldHide ? 0 : amountElem?.getBoundingClientRect().width ?? 0;

    if (newWidth === 24) {
      amountElemWidth.set(0);
    } else {
      amountElemWidth.set(newWidth);
    }

    setTimeout(() => {
      amountTransitioning = false;
      if (hide === true) isPeeking = false;
    }, 500);

    if (peekAmount && shouldHide === false) {
      isPeeking = true;

      setTimeout(() => {
        updateAmountToShow(true);
      }, 2000);
    }
  }

  $: {
    $amount;
    loading;
    if (browser && $amount) {
      updateAmountToShow();
    }
  }

  $: nothingToCollect = amountToShow?.fiatEstimateCents === 0;

  function handleClick() {
    modal.show(Stepper, undefined, globalCollectFlowSteps(amounts));
  }
</script>

<button
  data-testid="global-collect-button"
  on:click={handleClick}
  disabled={loading}
  class:nothing-to-collect={nothingToCollect}
>
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
      <div transition:fade|global class="loading-state">
        <Spinner />
      </div>
    {/if}
    <Download style="fill: var(--color-foreground)" />
    Collect
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
    transition:
      background-color 0.3s,
      color 0.3s,
      transform 0.2s,
      box-shadow 0.2s,
      opacity 0.3s;
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

  button:not(:disabled):hover,
  button:not(:disabled):focus-visible {
    box-shadow:
      0px 0px 0px 1px var(--color-foreground),
      0 2px 0px 1px var(--color-foreground),
      inset 0 0px 0px 0px var(--color-foreground);
    transform: translateY(-2px);
    opacity: 1;
  }

  button:not(:disabled):active {
    transform: translateY(0px);
    box-shadow:
      0px 0px 0px 1px var(--color-foreground),
      0 0px 0px 0px var(--color-foreground);
  }
</style>
