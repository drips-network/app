<script lang="ts">
  import walletStore from '$lib/stores/wallet/wallet.store';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';

  export let disclaimerType: 'splits' | 'drips';

  $: safeAppMode = Boolean($walletStore.safe);
</script>

{#if safeAppMode}
  <AnnotationBox type="info">
    <div>
      <h4 class="typo-text-small-bold">Using Drips with a Safe</h4>
      <p class="typo-text-small">
        Please note that this transaction might fail after any previously-created, currently-pending
        transaction that adjusts your {disclaimerType === 'drips'
          ? 'Drips configuration for this token'
          : 'Splits configuration'} is executed.
      </p>
      <a
        class="typo-link"
        href="https://v2.docs.drips.network/docs/the-drips-app/advanced/safe#some-transactions-are-invalidated-by-updates-to-a-drips-accounts-state"
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
