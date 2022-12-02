<script>
  import wallet from '$lib/stores/wallet';
  import SettingsIcon from 'radicle-design-system/icons/Settings.svelte';
  import ServerIcon from 'radicle-design-system/icons/Server.svelte';
  import UserIcon from 'radicle-design-system/icons/User.svelte';

  import CrossIcon from 'radicle-design-system/icons/CrossSmall.svelte';
  import Button from '../button/button.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import AccountMenuItem from './components/account-menu-item.svelte';
  import Divider from '../divider/divider.svelte';
  import ens from '$lib/stores/ens';
</script>

<div class="account-menu">
  {#if $wallet.address}
    <AccountMenuItem>
      <svelte:fragment slot="left"
        ><IdentityBadge
          size="big"
          disableLink
          address={$wallet.address}
          showIdentity={false}
          disableSelection
        /></svelte:fragment
      >
      <svelte:fragment slot="title"
        ><IdentityBadge
          disableSelection
          disableLink
          address={$wallet.address}
          showAvatar={false}
        /></svelte:fragment
      >
      <svelte:fragment slot="right"
        ><Button icon={CrossIcon} on:click={wallet.disconnect}>Disconnect</Button></svelte:fragment
      >
    </AccountMenuItem>
    <Divider sideMargin={0.5} />
    <AccountMenuItem icon={ServerIcon} href="/app/dashboard">
      <svelte:fragment slot="title">Dashboard</svelte:fragment>
    </AccountMenuItem>
    <AccountMenuItem
      icon={UserIcon}
      href={`/app/${$ens[$wallet.address]?.name ?? $wallet.address}`}
    >
      <svelte:fragment slot="title">Profile</svelte:fragment>
    </AccountMenuItem>
    <AccountMenuItem icon={SettingsIcon} href="/app/settings">
      <svelte:fragment slot="title">Settings</svelte:fragment>
    </AccountMenuItem>
  {/if}
</div>

<style>
  .account-menu {
    display: flex;
    gap: 0.25rem;
    flex-direction: column;
    padding: -0.5rem;
  }
</style>
