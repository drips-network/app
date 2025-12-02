<script lang="ts">
  import { run } from 'svelte/legacy';

  import addCustomTokenFlowSteps from '$lib/flows/add-custom-token/add-custom-token-flow-steps';
  import modal from '$lib/stores/modal';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import fiatEstimatesStore from '$lib/utils/fiat-estimates/fiat-estimates';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import unreachable from '$lib/utils/unreachable';
  import FiatEstimateValue from '../aggregate-fiat-estimate/fiat-estimate-value.svelte';
  import Stepper from '../stepper/stepper.svelte';
  import Token from '../token/token.svelte';

  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  interface Props {
    amounts: Amount[];
  }

  let { amounts }: Props = $props();
  let tokenAddresses = $derived(amounts.map((a) => a.tokenAddress));
  let tokens = $derived($tokensStore && tokenAddresses.map((a) => tokensStore.getByAddress(a)));

  let priceStore = $derived(fiatEstimatesStore.price(tokenAddresses ?? []));

  const fiatEstimatesStarted = fiatEstimatesStore.started;
  run(() => {
    if ($fiatEstimatesStarted && tokenAddresses && tokenAddresses.length > 0) {
      fiatEstimatesStore.track(tokenAddresses);
    }
  });

  let fiatEstimates: (number | 'pending' | 'unsupported' | undefined)[] = $state([]);

  run(() => {
    amounts.forEach(({ tokenAddress, amount }, index) => {
      const token = tokensStore.getByAddress(tokenAddress);

      if (!token) {
        fiatEstimates[index] = 'unsupported';
        return;
      }

      fiatEstimates[index] = fiatEstimatesStore.convert(
        { amount, tokenAddress },
        token.info.decimals,
        $priceStore,
      );
    });
  });
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
        <div class="w-full my-1 sm:hidden"></div>
        <div class="muted sm:flex-1 sm:text-right">
          {formatTokenAmount(amount, tokens[i]?.info.decimals ?? unreachable(), 1n, false)}
          {tokens[i]?.info.symbol}
        </div>
      {:else if tokensStore.customTokensLoaded}
        <button
          onclick={() => modal.show(Stepper, undefined, addCustomTokenFlowSteps(tokenAddress))}
          >Unknown token</button
        >
      {/if}
    </li>
  {/each}
</ul>

<style>
  li + li {
    border-top: 1px solid var(--color-foreground-level-3);
  }

  .muted {
    color: var(--color-foreground-level-5);
  }
</style>
