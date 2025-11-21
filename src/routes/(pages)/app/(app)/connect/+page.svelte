<script lang="ts">
  import { run } from 'svelte/legacy';

  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import type { PageData } from './$types';
  import DisconnectedState from '$lib/components/section-skeleton/disconnected-state.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const { backTo, requireRpgfSignIn } = data;

  let emptyStateText: string | undefined = $state();
  let headline: string | undefined = $state(undefined);
  let emoji: string | undefined = $state(undefined);
  run(() => {
    switch (true) {
      case requireRpgfSignIn && $walletStore.connected:
        emoji = '🔐';
        headline = `Sign in to continue`;
        emptyStateText = `You need to sign in with your wallet to access RetroPGF on Drips features. This does not require a transaction.`;
        break;
      case requireRpgfSignIn:
        emoji = '👛';
        headline = `No wallet connected`;
        emptyStateText = `Connect your Ethereum wallet to access RetroPGF on Drips.`;
        break;
      case /\/app\/funds/.test(backTo):
        emoji = '👛';
        headline = 'No wallet connected';
        emptyStateText = `You don’t have a wallet connected, so there are no funds to show here.`;
        break;
      case /\/app\/profile/.test(backTo):
        emoji = '👛';
        headline = 'No wallet connected';
        emptyStateText = `You don’t have a wallet connected, so there is no profile to show. When you connect your wallet, your projects, Drip Lists, and funds will show up here.`;
        break;
      default:
        emoji = '👛';
        headline = 'No wallet connected';
        emptyStateText = 'Connect a wallet to continue.';
    }
  });
</script>

<HeadMeta title="Drips" />

<DisconnectedState {emoji} {headline} text={emptyStateText} {requireRpgfSignIn} />
