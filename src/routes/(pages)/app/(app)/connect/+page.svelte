<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import type { PageData } from './$types';
  import DisconnectedState from '$lib/components/section-skeleton/disconnected-state.svelte';

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

<DisconnectedState headline="No wallet connected" text={emptyStateText} />
