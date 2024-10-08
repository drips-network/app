<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import WalletIcon from '$lib/components/icons/Wallet.svelte';
  import wallet from '$lib/stores/wallet/wallet.store';
  import Flyout from '../flyout/flyout.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import AccountMenu from '../account-menu/account-menu.svelte';
  import SafeLogo from '../icons/safe-logo.svelte';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';

  $: safeAppMode = Boolean($wallet.safe);

  const walletInitializedStore = wallet.initialized;
  const waitingForOnboardStore = wallet.waitingForOnboard;
</script>

<div class="wrapper">
  {#if $wallet.connected}
    <div class="desktop-only">
      <Flyout>
        <div class="trigger" slot="trigger">
          {#if safeAppMode}<div class="safe-logo">
              <SafeLogo />
            </div>{/if}
          <IdentityBadge
            disableTooltip
            hideAvatarOnMobile
            disableLink
            size="medium"
            address={$wallet.address}
          />
        </div>
        <div slot="content">
          <AccountMenu />
        </div>
      </Flyout>
    </div>
    <div
      class="mobile-only"
      role="button"
      tabindex="0"
      on:click={() => cupertinoPaneStore.openSheet(AccountMenu, undefined)}
      on:keydown={() => cupertinoPaneStore.openSheet(AccountMenu, undefined)}
    >
      <IdentityBadge
        hideAvatarOnMobile
        disableLink
        size="medium"
        address={$wallet.address}
        disableTooltip
      />
    </div>
  {:else}
    <Button
      disabled={$waitingForOnboardStore}
      loading={!$walletInitializedStore}
      icon={WalletIcon}
      on:click={() => wallet.connect()}>Connect</Button
    >
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .trigger {
    display: flex;
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
