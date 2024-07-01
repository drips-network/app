<script lang="ts">
  import { goto } from '$app/navigation';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import wallet from '$lib/stores/wallet/wallet.store';
</script>

<HeadMeta title="Drips" />

<LargeEmptyState
  emoji="🌐"
  headline="Connect to Drips"
  description="Connect an Ethereum wallet to continue to your Dashboard."
  button={{ label: 'Connect wallet', handler: () => wallet.connect() }}
  secondaryButton={{ label: 'Explore Drips', handler: () => goto('/app') }}
/>
