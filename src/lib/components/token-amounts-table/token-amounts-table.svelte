<script lang="ts">
  import addCustomTokenFlowSteps from '$lib/flows/add-custom-token/add-custom-token-flow-steps';
  import modal from '$lib/stores/modal';
  import tokensStore, { type TokenInfoWrapper } from '$lib/stores/tokens/tokens.store';
  import fiatEstimatesStore from '$lib/utils/fiat-estimates/fiat-estimates';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import unreachable from '$lib/utils/unreachable';
  import Download from 'radicle-design-system/icons/Download.svelte';
  import FiatEstimateValue from '../aggregate-fiat-estimate/fiat-estimate-value.svelte';
  import Button from '../button/button.svelte';
  import Stepper from '../stepper/stepper.svelte';
  import Token from '../token/token.svelte';
  import getCollectFlowSteps from '$lib/flows/collect-flow/collect-flow-steps';

  export let showCollectButtons = false;

  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  export let amounts: Amount[];

  $: tokens = amounts.map((amount) => tokensStore.getByAddress(amount.tokenAddress));
  $: knownTokens = tokens.filter((token): token is TokenInfoWrapper => token !== undefined);
  $: knownSymbols = knownTokens.map((token) => token.info.symbol);

  $: priceStore = fiatEstimatesStore.price(knownSymbols);

  let fiatEstimates: (number | 'pending' | 'unsupported' | undefined)[] = [];

  $: {
    $priceStore;

    amounts.forEach(({ tokenAddress, amount }, index) => {
      fiatEstimates[index] = fiatEstimatesStore.convert({ amount, tokenAddress });
    });

    fiatEstimates = fiatEstimates;
  }

  function openCollectModal(tokenAddress: string) {
    modal.show(Stepper, undefined, getCollectFlowSteps(tokenAddress));
  }
</script>

<div class="token-amounts-dropdown">
  {#each amounts as { tokenAddress, amount }, i}
    <div class="token-amount">
      {#if tokens[i]}
        <div class="token">
          <Token address={tokenAddress} />
        </div>
        <div class="amounts typo-text tabular-nums">
          <div class="token amount muted">
            {formatTokenAmount(amount, tokens[i]?.info.decimals ?? unreachable(), 1n, false)}
            {tokens[i]?.info.symbol}
          </div>
          <div class="fiat amount">
            <FiatEstimateValue fiatEstimateCents={fiatEstimates[i]} />
          </div>
          {#if showCollectButtons}
            <div class="collect-button">
              <Button icon={Download} on:click={() => openCollectModal(tokenAddress)}
                >Collect</Button
              >
            </div>
          {/if}
        </div>
      {:else}
        <button
          on:click={() => modal.show(Stepper, undefined, addCustomTokenFlowSteps(tokenAddress))}
          >Unknown token</button
        >
      {/if}
    </div>
  {/each}
</div>

<style>
  .token-amounts-dropdown {
    background-color: var(--color-foreground-level-1);
  }

  .token-amount {
    display: flex;
    gap: 1rem;
    align-items: center;
    height: 3rem;
    padding: 0 1rem;
  }

  .token-amount:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground);
  }

  .token {
    flex: 1.25;
    white-space: nowrap;
  }

  .amounts {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex: 1;
  }

  .amounts .amount {
    flex: 1;
  }

  .amount {
    white-space: nowrap;
  }

  .fiat.amount {
    display: flex;
    justify-content: flex-end;
  }

  .muted {
    color: var(--color-foreground-level-6);
  }
</style>