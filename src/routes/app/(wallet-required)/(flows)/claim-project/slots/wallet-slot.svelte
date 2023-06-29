<script lang="ts">
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
</script>

{#if $walletStore.address}
  <IdentityBadge disableLink showFullAddress size="medium" address={$walletStore.address} />
{:else}
  No wallet connected
{/if}
