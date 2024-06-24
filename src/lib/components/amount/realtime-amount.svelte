<script lang="ts">
  import { streamCurrentAmountsStore } from '$lib/utils/current-amounts';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import FormattedAmount from '../formatted-amount/formatted-amount.svelte';
  import amtDeltaUnitStore, {
    FRIENDLY_NAMES,
    MULTIPLIERS,
  } from '$lib/stores/amt-delta-unit/amt-delta-unit.store';
  import modal from '$lib/stores/modal';
  import Stepper from '../stepper/stepper.svelte';
  import addCustomTokenFlowSteps from '$lib/flows/add-custom-token/add-custom-token-flow-steps';
  import { fade } from 'svelte/transition';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import { constants } from 'radicle-drips';
  import type {
    CurrentAmountsTimelineItemFragment,
    CurrentAmountsUserBalanceTimelineItemFragment,
  } from '$lib/utils/__generated__/gql.generated';

  export let timeline: (
    | CurrentAmountsTimelineItemFragment
    | CurrentAmountsUserBalanceTimelineItemFragment
  )[];
  export let tokenAddress: string;

  export let showFiatValue = false;

  export let unknownTokenButton = true;

  export let showDelta = true;

  $: currentAmountsStore = streamCurrentAmountsStore(timeline, tokenAddress);
  $: token =
    $tokensStore && tokensStore.getByAddress($currentAmountsStore.currentAmount.tokenAddress);

  function applyAmtPerSecMultiplier(amount: bigint, multiplier: number) {
    return amount * BigInt(multiplier);
  }
</script>

<div class="realtime-amount">
  {#if timeline.length === 0}
    <span in:fade={{ duration: 300 }} class="typo-text tabular-nums"> 0.00 </span>
    {#if showDelta}
      <span in:fade={{ duration: 300 }} class="delta typo-text-small">
        0.00 /{FRIENDLY_NAMES[$amtDeltaUnitStore]}
      </span>
    {/if}
  {:else if token}
    <span in:fade={{ duration: 300 }} class="typo-text tabular-nums">
      {#if showFiatValue}
        <AggregateFiatEstimate
          amounts={[
            {
              tokenAddress: $currentAmountsStore.currentAmount.tokenAddress,
              amount:
                $currentAmountsStore.currentAmount.amount /
                BigInt(constants.AMT_PER_SEC_MULTIPLIER),
            },
          ]}
        />
      {:else}
        <FormattedAmount
          amount={$currentAmountsStore.currentAmount.amount}
          decimals={token.info.decimals}
        />
      {/if}
    </span>
    {#if showDelta}
      <span in:fade={{ duration: 300 }} class="delta typo-text-small">
        {#if $currentAmountsStore.currentDeltaPerSecond.amount > 0}
          +
        {/if}
        <FormattedAmount
          amount={applyAmtPerSecMultiplier(
            $currentAmountsStore.currentDeltaPerSecond.amount,
            MULTIPLIERS[$amtDeltaUnitStore],
          )}
          decimals={token.info.decimals}
          preserveTrailingZeroes={false}
        />
        /{FRIENDLY_NAMES[$amtDeltaUnitStore]}
      </span>
    {/if}
  {:else if tokensStore.customTokensLoaded}
    <button
      class="typo-text"
      style:color="var(--color-foreground-level-5)"
      on:click={(e) => {
        if (!unknownTokenButton) return;

        e.stopImmediatePropagation();
        modal.show(
          Stepper,
          undefined,
          addCustomTokenFlowSteps($currentAmountsStore.currentAmount.tokenAddress),
        );
      }}>Unknown token</button
    >
  {:else}
    <!-- Empty span while tokens store is loading (can only be visible on SSR'd pages where blockWhileInitializing set to false) -->
    <!-- eslint-disable-next-line no-irregular-whitespace -->
    <span>​</span>
  {/if}
</div>

<style>
  .realtime-amount {
    display: flex;
    flex-direction: column;
  }

  .delta {
    color: var(--color-foreground-level-5);
  }
</style>
