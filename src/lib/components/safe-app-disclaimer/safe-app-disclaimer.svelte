<script lang="ts">
  import walletStore from '$lib/stores/wallet/wallet.store';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';

  interface Props {
    disclaimerType: 'splits' | 'drips';
  }

  let { disclaimerType }: Props = $props();

  let safeAppMode = $derived(Boolean($walletStore.safe));
</script>

{#if safeAppMode}
  <AnnotationBox type="info">
    <div>
      <h4 class="typo-text-small-bold">Using Drips with a Safe</h4>
      <p class="typo-text-small">
        Please note that if your safe has any pending transactions {disclaimerType === 'drips'
          ? 'for this token in your Drips account'
          : 'that update your Splits configuration'}, you will need to wait for their confirmation
        first, otherwise this transaction may fail.
      </p>
      <a
        class="typo-link"
        href="https://docs.drips.network/advanced/usage-with-a-safe"
        target="_blank"
        rel="noreferrer">Learn more</a
      >
    </div></AnnotationBox
  >
{/if}

<style>
  div {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
