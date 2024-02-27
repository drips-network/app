<script lang="ts">
  import addCustomTokenFlowSteps from '$lib/flows/add-custom-token/add-custom-token-flow-steps';
  import modal from '$lib/stores/modal';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import fiatEstimatesStore from '$lib/utils/fiat-estimates/fiat-estimates';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import unreachable from '$lib/utils/unreachable';
  import Download from '$lib/components/icons/Download.svelte';
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
  $: tokenAddresses = amounts.map((a) => a.tokenAddress);
  $: tokens = $tokensStore && tokenAddresses.map((a) => tokensStore.getByAddress(a));

  $: priceStore = fiatEstimatesStore.price(tokenAddresses ?? []);

  const fiatEstimatesStarted = fiatEstimatesStore.started;
  $: {
    if ($fiatEstimatesStarted && tokenAddresses && tokenAddresses.length > 0) {
      fiatEstimatesStore.track(tokenAddresses);
    }
  }

  let fiatEstimates: (number | 'pending' | 'unsupported' | undefined)[] = [];

  const connected = tokensStore.connected;

  $: {
    $priceStore;

    if ($connected) {
      amounts.forEach(({ tokenAddress, amount }, index) => {
        const token = tokensStore.getByAddress(tokenAddress);

        if (!token) {
          fiatEstimates[index] = 'unsupported';
          return;
        }

        fiatEstimates[index] = fiatEstimatesStore.convert(
          { amount, tokenAddress },
          token.info.decimals,
          priceStore,
        );
      });
    }

    fiatEstimates = fiatEstimates;
  }

  function openCollectModal(tokenAddress: string) {
    modal.show(Stepper, undefined, getCollectFlowSteps(tokenAddress));
  }
</script>

<ul class="token-amounts-dropdown">
  {#each amounts as { tokenAddress, amount }, i}
    <li class="flex flex-wrap items-center justify-between px-4 py-4 sm:py-0 sm:h-14 sm:gap-6">
      {#if tokens && tokens[i]}
        <div class="-ml-1">
          <Token address={tokenAddress} />
        </div>
        <div class="sm:order-last">
          <FiatEstimateValue fiatEstimateCents={fiatEstimates[i]} />
        </div>
        <div class="w-full my-1 sm:hidden" />
        <div class="muted sm:flex-1 sm:text-right">
          {formatTokenAmount(amount, tokens[i]?.info.decimals ?? unreachable(), 1n, false)}
          {tokens[i]?.info.symbol}
        </div>
        {#if showCollectButtons}
          <div class="-mr-1 sm:order-last">
            <Button icon={Download} on:click={() => openCollectModal(tokenAddress)}>Collect</Button>
          </div>
        {/if}
      {:else if $connected}
        <button
          on:click={() => modal.show(Stepper, undefined, addCustomTokenFlowSteps(tokenAddress))}
          >Unknown token</button
        >
      {/if}
    </li>
  {/each}
</ul>

<style>
  li + li {
    border-top: 1px solid var(--color-foreground);
  }

  .muted {
    color: var(--color-foreground-level-5);
  }
</style>
