<script lang="ts">
  import ActionableEmptyState from '$lib/components/actionable-empty-state/actionable-empty-state.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import wallet from '$lib/stores/wallet/wallet.store';
  import type { PageData } from './$types';

  export let data: PageData;

  const { backTo } = data;

  let emptyStateText: string;
  $: {
    switch (true) {
      case /\/app\/funds/.test(backTo):
        emptyStateText = `You don’t have a wallet connected, so there are no funds to show here.`;
        break;
      case /\/app\/profile/.test(backTo):
        emptyStateText = `You don’t have a wallet connected, so there is no profile to show. When you connect your wallet, your projects, Drip Lists, and funds will show up here.`;
        break;
      default:
        emptyStateText = 'Connect a wallet to continue.';
    }
  }
</script>

<HeadMeta title="Drips" />

<ActionableEmptyState
  headline="No wallet connected"
  description={emptyStateText}
  button={{ label: 'Connect a wallet', handler: () => wallet.connect() }}
/>
