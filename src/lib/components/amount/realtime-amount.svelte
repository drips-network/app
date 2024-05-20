<script lang="ts">
  import type { CurrentAmountsTimelineItemFragment, CurrentAmountsUserBalanceTimelineItemFragment } from "$lib/flows/create-stream-flow/methods/__generated__/gql.generated";
  import { streamCurrentAmountsStore } from "$lib/flows/create-stream-flow/methods/current-amounts";
  import tokensStore from "$lib/stores/tokens/tokens.store";
  import FormattedAmount from "../formatted-amount/formatted-amount.svelte";
  import amtDeltaUnitStore, {
    FRIENDLY_NAMES,
    MULTIPLIERS,
  } from '$lib/stores/amt-delta-unit/amt-delta-unit.store';
  import modal from "$lib/stores/modal";
  import Stepper from "../stepper/stepper.svelte";
  import addCustomTokenFlowSteps from "$lib/flows/add-custom-token/add-custom-token-flow-steps";

  export let timeline: (CurrentAmountsTimelineItemFragment | CurrentAmountsUserBalanceTimelineItemFragment)[];

  $: currentAmountsStore = streamCurrentAmountsStore(timeline);
  $: token = $tokensStore && tokensStore.getByAddress($currentAmountsStore.currentAmount.tokenAddress);

  function applyAmtPerSecMultiplier(amount: bigint, multiplier: number) {
    return amount * BigInt(multiplier);
  }
</script>

<div class="realtime-amount">
  {#if timeline.length === 0}
    <span class="typo-text tabular-nums">
      0.00
    </span>
    <span class="delta typo-text-small">
      0.00 / {FRIENDLY_NAMES[$amtDeltaUnitStore]}
    </span>
  {:else if token}
    <span class="typo-text tabular-nums">
      <FormattedAmount amount={$currentAmountsStore.currentAmount.amount} decimals={token.info.decimals} />
    </span>
    <span class="delta typo-text-small">
      {#if $currentAmountsStore.currentDeltaPerSecond.amount > 0}
        +
      {/if}
      <FormattedAmount amount={applyAmtPerSecMultiplier($currentAmountsStore.currentDeltaPerSecond.amount, MULTIPLIERS[$amtDeltaUnitStore])} decimals={token.info.decimals} />
      / {FRIENDLY_NAMES[$amtDeltaUnitStore]}
    </span>
  {:else}
    <button class="typo-text" style:color="var(--color-foreground-level-5)" on:click={
      (e) => {
        modal.show(Stepper, undefined, addCustomTokenFlowSteps($currentAmountsStore.currentAmount.tokenAddress));
        e.stopPropagation();
      }
    }>Unknown token</button>
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
