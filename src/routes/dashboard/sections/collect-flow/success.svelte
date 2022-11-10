<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import LineItems from '$lib/components/line-items/line-items.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import modal from '$lib/stores/modal';
  import tokens from '$lib/stores/tokens';
  import wallet from '$lib/stores/wallet';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import unreachable from '$lib/utils/unreachable';
  import type { Writable } from 'svelte/store';
  import type { CollectFlowState } from './collect-flow-state';

  export let context: Writable<CollectFlowState>;

  $: tokenAddress = $context.tokenAddress ?? unreachable();
  $: tokenInfo = tokens.getByAddress(tokenAddress) ?? unreachable();
  $: amountCollected = $context.amountCollected ?? unreachable();
  $: ownAddress = $wallet.address ?? unreachable();
</script>

<StepLayout>
  <EmojiAndToken emoji="✅" {tokenAddress} animateTokenOnMount />
  <StepHeader
    headline="Success"
    description={`You've successfully collected ${tokenInfo.info.symbol}.`}
  />
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
  <p>
    Your funds have been transferred to your address {ownAddress}. Please note that it may take some
    time for your dashboard to update.
  </p>
  <svelte:fragment slot="actions">
    <Button on:click={() => modal.hide()}>Done</Button>
  </svelte:fragment>
</StepLayout>

<style>
  p {
    color: var(--color-foreground-level-6);
  }
</style>
