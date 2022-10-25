<script>
  import wallet from '$lib/stores/wallet';
  import SettingsIcon from 'radicle-design-system/icons/Settings.svelte';
  import CrossIcon from 'radicle-design-system/icons/CrossSmall.svelte';
  import Button from '../button/button.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import AccountMenuItem from './components/account-menu-item.svelte';
  import { goto } from '$app/navigation';
  import Divider from '../divider/divider.svelte';
</script>

<div class="account-menu">
  {#if $wallet.address}
    <AccountMenuItem>
      <svelte:fragment slot="left"
        ><IdentityBadge
          size="big"
          address={$wallet.address}
          showIdentity={false}
        /></svelte:fragment
      >
      <svelte:fragment slot="title"
        ><IdentityBadge address={$wallet.address} showAvatar={false} /></svelte:fragment
      >
      <svelte:fragment slot="right"
        ><Button icon={CrossIcon} on:click={wallet.disconnect}>Disconnect</Button></svelte:fragment
      >
    </AccountMenuItem>
    <Divider />
    <AccountMenuItem icon={SettingsIcon} onClick={() => goto('/settings')}>
      <svelte:fragment slot="title">Settings</svelte:fragment>
    </AccountMenuItem>
  {/if}
</div>

<style>
  .account-menu {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    padding: -0.25rem;
  }
</style>
