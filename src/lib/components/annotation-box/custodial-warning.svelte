<script lang="ts">
  import AnnotationBox from './annotation-box.svelte';
  import ThumbsUpIcon from '$lib/components/icons/ThumbsUp.svelte';
  import Button from '../button/button.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import { browser } from '$app/environment';
  import { slide } from 'svelte/transition';

  export let dismissableId: string = 'custodial';

  $: dismissed = browser ? $dismissablesStore.includes(dismissableId) : false;

  async function handleDismiss() {
    dismissablesStore.dismiss(dismissableId);
  }
</script>

{#if !dismissed}
  <div transition:slide={{ duration: 300 }}>
    <AnnotationBox type="error">
      <span class="warning-text typo-text"
        >Please ensure all addresses are self-custodial. Any funds sent to exchange-managed
        addresses (e.g. Coinbase or Binance) <strong class="typo-text-bold">will be lost.</strong
        ></span
      >
      <svelte:fragment slot="actions">
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
