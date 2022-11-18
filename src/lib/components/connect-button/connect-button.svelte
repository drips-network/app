<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';
  import wallet from '$lib/stores/wallet';
  import Flyout from '../flyout/flyout.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import AccountMenu from '../account-menu/account-menu.svelte';
</script>

{#if $wallet.connected}
  <Flyout>
    <div slot="trigger">
      <IdentityBadge hideAvatarOnMobile disableLink size="medium" address={$wallet.address} />
    </div>
    <div slot="content">
      <AccountMenu />
    </div>
  </Flyout>
{:else}
  <Button icon={WalletIcon} on:click={wallet.connect}>Connect wallet</Button>
{/if}
