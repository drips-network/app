<script lang="ts">
  import wallet from '$lib/stores/wallet/wallet.store';
  import ActionableEmptyState from './actionable-empty-state.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';

  export let emoji: string = '🫙';
  export let headline: string | undefined = 'You are disconnected';
  export let text: string | undefined = 'Please connect your wallet to see this section.';
</script>

<ActionableEmptyState
  {emoji}
  {headline}
  description={text}
  button={{ label: 'Connect a wallet', icon: Wallet, handler: () => wallet.connect() }}
/>
