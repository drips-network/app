<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';
  import wallet from '$lib/stores/wallet';
  import ens from '$lib/stores/ens';
  import drips from '$lib/stores/drips';
  import Flyout from '../flyout/flyout.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import AccountMenu from '../account-menu/account-menu.svelte';
  import tokens from '$lib/stores/tokens';

  $: {
    if ($wallet?.connected) {
      const { provider, address, network } = $wallet ?? {};
      if (!provider || !address) throw new Error('No provider after connection');

      // Connect all stores to wallet
      ens.connect(provider);
      drips.connect(provider);
      tokens.connect(network.chainId);

      // Lookup own name
      ens.lookup(address);
    } else {
      // Disconnect all stores from wallet
      ens.disconnect();
      drips.disconnect();
      tokens.disconnect();
    }
  }
</script>

{#if $wallet}
  <Flyout>
    <div slot="trigger">
      <IdentityBadge address={$wallet.address} />
    </div>
    <div slot="content">
      <AccountMenu />
    </div>
  </Flyout>
{:else}
  <Button icon={WalletIcon} on:click={wallet.connect}>Connect wallet</Button>
{/if}
