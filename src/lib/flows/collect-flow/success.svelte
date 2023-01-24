<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import LineItems from '$lib/components/line-items/line-items.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import tokens from '$lib/stores/tokens';
  import wallet from '$lib/stores/wallet';
  import etherscanLink from '$lib/utils/etherscan-link';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import unreachable from '$lib/utils/unreachable';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { CollectFlowState } from './collect-flow-state';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<CollectFlowState>;

  $: tokenAddress = $context.tokenAddress ?? unreachable();
  $: tokenInfo = tokens.getByAddress(tokenAddress) ?? unreachable();
  // If amountCollected is undefined, the subgraph didn't index the collect amount in time,
  // so we just don't show the collected amount (this should rarely be the case).
  $: amountCollected = $context.amountCollected;
  $: txReceipt = $context.receipt ?? unreachable();
</script>

<StepLayout>
  <EmojiAndToken emoji="✅" {tokenAddress} animateTokenOnMount />
  <StepHeader
    headline="Success"
    description={`You've successfully collected ${tokenInfo.info.symbol}.`}
  />
  {#if amountCollected}
    <LineItems
      lineItems={[
        {
          title: 'Amount collected',
          value: `${formatTokenAmount(
            { tokenAddress, amount: amountCollected },
            tokenInfo.info.decimals,
            1n,
          )}`,
          symbol: tokenInfo.info.symbol,
        },
      ]}
    />
  {/if}
  <p>
    Your funds have been sent to your wallet. Please note that it may take some time for your
    dashboard to update.
  </p>
  <a
    href={etherscanLink($wallet.network.name, txReceipt.transactionHash)}
    target="_blank"
    class="typo-link">View on Etherscan</a
  >
  <svelte:fragment slot="actions">
    <Button variant="primary" on:click={() => dispatch('conclude')}>Done</Button>
  </svelte:fragment>
</StepLayout>

<style>
  p {
    color: var(--color-foreground-level-6);
  }
</style>
