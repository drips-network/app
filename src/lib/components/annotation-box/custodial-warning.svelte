<script lang="ts">
  import AnnotationBox from './annotation-box.svelte';
  import ThumbsUpIcon from '$lib/components/icons/ThumbsUp.svelte';
  import Button from '../button/button.svelte';

  function handleUnderstanding() {
    // eslint-disable-next-line no-console
    console.log('I understand');
  }
</script>

<AnnotationBox type="error">
  <span class="typo-text"
    >Please ensure all addresses are self-custodial. Any funds sent to exchange-managed addresses
    (e.g. Coinbase or Binance) <strong class="typo-text-bold">will be lost</strong></span
  >.
  <svelte:fragment slot="actions">
    <Button icon={ThumbsUpIcon} variant="destructive" on:click={handleUnderstanding}
      >I understand</Button
    >
  </svelte:fragment>
</AnnotationBox>

<style>
  strong {
  }
</style>
