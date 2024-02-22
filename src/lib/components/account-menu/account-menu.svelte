<script>
  import wallet from '$lib/stores/wallet/wallet.store';
  import UserIcon from 'radicle-design-system/icons/User.svelte';
  import Button from '../button/button.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import AccountMenuItem from './components/account-menu-item.svelte';
  import Divider from '../divider/divider.svelte';
  import ens from '$lib/stores/ens';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import { navigating } from '$app/stores';
  import LegalLinks from '../legal-links/legal-links.svelte';
  import Settings from 'radicle-design-system/icons/Settings.svelte';

  $: $navigating && cupertinoPaneStore.closeSheet();

  $: safeAppMode = Boolean($wallet.safe);
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
          disableTooltip
        /></svelte:fragment
      >
      <svelte:fragment slot="title"
        ><IdentityBadge
          disableSelection
          disableLink
          address={$wallet.address}
          showAvatar={false}
          disableTooltip
        /></svelte:fragment
      >
      <svelte:fragment slot="right"
        ><Button
          disabled={safeAppMode}
          variant="ghost"
          on:click={() => {
            cupertinoPaneStore.closeSheet();
            wallet.disconnect();
          }}>Disconnect</Button
        ></svelte:fragment
      >
    </AccountMenuItem>
    {#if safeAppMode}
      <div class="connected-to-safe">
        <AnnotationBox size="small" type="info">
          <div>
            <h4 class="typo-text-small-bold">Connected to Safe</h4>
            <p class="typo-text-small">All transactions will be proposed to the connected Safe.</p>
            <a
              class="typo-link"
              href="https://docs.drips.network/usage-with-a-safe"
              target="_blank"
              rel="noreferrer">Learn more</a
            >
          </div>
        </AnnotationBox>
      </div>
    {/if}
    <Divider sideMargin={0.5} />
    <div class="flex flex-col">
      <AccountMenuItem
        icon={UserIcon}
        href={`/app/${$ens[$wallet.address]?.name ?? $wallet.address}`}
      >
        <svelte:fragment slot="title">Profile</svelte:fragment>
      </AccountMenuItem>
      <AccountMenuItem icon={Settings} href="/app/settings">
        <svelte:fragment slot="title">Settings</svelte:fragment>
      </AccountMenuItem>
    </div>
    <Divider sideMargin={0.5} />
    <LegalLinks />
  {/if}
</div>

<style>
  .account-menu {
    display: flex;
    gap: 0.25rem;
    flex-direction: column;
    padding: -0.5rem;
  }

  .connected-to-safe {
    padding: 0 0.5rem;
    margin-bottom: 0.5rem;
  }

  .connected-to-safe div {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
