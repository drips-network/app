<script lang="ts">
  import { goto } from '$app/navigation';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import wallet from '$lib/stores/wallet/wallet.store';

  export let data;
  $: requireRpgfSignIn = data.requireRpgfSignIn;

  let headline: string;
  let description: string;
  $: {
    if ($wallet.connected && requireRpgfSignIn) {
      headline = 'Sign in to Drips RPGF';
      description =
        'Confirm your identity using your wallet to access this page. This does not require a transaction.';
    } else {
      headline = 'Connect to Drips';
      description = 'Connect an Ethereum wallet to continue.';
    }
  }
</script>

<HeadMeta title="Drips" />

<LargeEmptyState
  emoji="🌐"
  {headline}
  {description}
  button={requireRpgfSignIn
    ? undefined
    : { label: 'Connect wallet', handler: () => wallet.connect() }}
  showSiweButton={requireRpgfSignIn}
  secondaryButton={{ label: 'Explore Drips', handler: () => goto('/app') }}
  on:signIn={window.location.reload}
/>
