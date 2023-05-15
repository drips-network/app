<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import ensStore from '$lib/stores/ens/ens.store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import CrossCircle from 'radicle-design-system/icons/CrossCircle.svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';

  $: address = $walletStore.address;

  async function connect() {
    await walletStore.connect();

    const address = $walletStore.address;
    if (address) ensStore.lookup(address);
  }
</script>

<div class="account-box" class:connected={address}>
  {#if address}
    <IdentityBadge disableLink {address} disableTooltip size="big" showFullAddress />
    <Button variant="ghost" icon={CrossCircle} on:click={() => walletStore.disconnect()}
      >Disconnect</Button
    >
  {:else}
    Connect your Ethereum wallet to continue
    <Button icon={Wallet} variant="primary" on:click={connect}>Connect wallet</Button>
  {/if}
</div>

<style>
  .account-box {
    background-color: var(--color-background);
    padding: 1rem;
    box-shadow: var(--elevation-low);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .account-box:not(.connected) {
    padding: 2rem 1rem;
    flex-direction: column;
    gap: 1rem;
  }
</style>
