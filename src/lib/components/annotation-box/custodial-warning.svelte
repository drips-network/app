<script lang="ts">
  import AnnotationBox from './annotation-box.svelte';
  import ThumbsUpIcon from '$lib/components/icons/ThumbsUp.svelte';
  import Button from '../button/button.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import { slide } from 'svelte/transition';

  export let dismissableId: string;

  async function handleDismiss() {
    dismissablesStore.dismiss(dismissableId);
  }
</script>

{#if !$dismissablesStore.includes(dismissableId)}
  <div transition:slide={{ duration: 300 }}>
    <AnnotationBox type="error">
      <span class="warning-text typo-text"
        >Please ensure you only split funds to self-custodial ETH addresses. Funds sent to
        custodial, exchange-managed addresses (e.g. Coinbase or Binance) will be lost.</span
      >
      <svelte:fragment slot="actions">
        <Button
          variant="ghost"
          href="https://docs.drips.network/faq/#can-i-split-or-stream-funds-directly-to-exchange-managed-ethereum-addresses"
          target="_blank">Learn more</Button
        >
        <Button icon={ThumbsUpIcon} variant="destructive" on:click={handleDismiss}
          >I understand</Button
        >
      </svelte:fragment>
    </AnnotationBox>
  </div>
{/if}

<style>
  /* re-align with icon because of larger font size */
  .warning-text {
    position: relative;
    top: -3px;
  }
</style>
