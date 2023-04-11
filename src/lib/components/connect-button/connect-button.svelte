<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';
  import wallet from '$lib/stores/wallet/wallet.store';
  import Flyout from '../flyout/flyout.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import AccountMenu from '../account-menu/account-menu.svelte';
  import SafeLogo from '../icons/safe-logo.svelte';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';

  $: safeAppMode = Boolean($wallet.safe);
</script>

{#if $wallet.connected}
  <div class="desktop-only">
    <Flyout>
      <div class="trigger" slot="trigger">
        {#if $wallet.network.chainId !== 1}
          <div class="network-badge">
            <p>{$wallet.network.name}</p>
          </div>
        {/if}
        {#if safeAppMode}<div class="safe-logo">
            <SafeLogo />
          </div>{/if}
        <IdentityBadge hideAvatarOnMobile disableLink size="medium" address={$wallet.address} />
      </div>
      <div slot="content">
        <AccountMenu />
      </div>
    </Flyout>
  </div>
  <div
    class="mobile-only"
    on:click={() => cupertinoPaneStore.openSheet(AccountMenu, undefined)}
    on:keydown={() => cupertinoPaneStore.openSheet(AccountMenu, undefined)}
  >
    <IdentityBadge hideAvatarOnMobile disableLink size="medium" address={$wallet.address} />
  </div>
{:else}
  <Button icon={WalletIcon} on:click={() => wallet.connect()}>Connect</Button>
{/if}

<style>
  .trigger {
    display: flex;
  }

  .network-badge {
    height: 2rem;
    padding: 0 8px;
    display: flex;
    align-content: center;
    justify-content: center;
    text-transform: capitalize;
    background-color: var(--color-primary-level-1);
    border-radius: 1rem 0 1rem 1rem;
    color: var(--color-primary-level-6);
    margin-right: 0.5rem;
  }

  .network-badge p {
    line-height: 2rem;
  }

  .trigger > .safe-logo {
    border-radius: 1rem;
    height: 2rem;
    width: 2rem;
    background-color: var(--color-primary);
    margin-right: -12px;
    z-index: 1;
  }

  .mobile-only {
    display: none;
  }

  @media (max-width: 768px) {
    .desktop-only {
      display: none;
    }

    .mobile-only {
      display: initial;
    }
  }
</style>
