<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Flyout from '$lib/components/flyout/flyout.svelte';
  import DripsLogo from '$lib/components/header/drips-logo.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import Drip from '$lib/components/illustrations/drip.svelte';
  import SupportButton from '$lib/components/intercom/support-button.svelte';
  import NotificationsButton from '$lib/components/notifications/notifications-button.svelte';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
  import type { ComponentProps } from 'svelte';
  import GithubUserBadge from '../github-user-badge/github-user-badge.svelte';
  import LogInButton from '../log-in-button/log-in-button.svelte';
  import Nav from '../nav/nav.svelte';
  import UserMenu from './components/user-menu.svelte';
  import Hamburger from '$lib/components/icons/Hamburger.svelte';

  let {
    user,
    pointsBalance,
    noBackground = false,
    mobileNavItems,
  }: {
    user: WaveLoggedInUser | null;
    pointsBalance: number | null;
    noBackground?: boolean;
    mobileNavItems: ComponentProps<typeof Nav>['items'];
  } = $props();

  const viewWidth = $derived($breakpointsStore?.dimensions.width);
  const mobileMode = $derived(viewWidth ? viewWidth <= 1024 : false);

  function handleMobileUserMenuClick() {
    if (!mobileMode) return;
    if (!user) return;

    cupertinoPaneStore.openSheet(UserMenu, { user });
  }
</script>

<header class:noBackground>
  <div class="left">
    {#if mobileMode}
      <button
        onclick={() =>
          cupertinoPaneStore.openSheet(Nav, {
            items: mobileNavItems,
            collapsed: false,
            mode: 'hamburger',
          })}
        aria-label="Open navigation menu"
      >
        <Hamburger />
      </button>
    {/if}

    <a class="typo-header-3 logo" href="/wave">
      <div class="desktop-only" style:height="100%">
        <DripsLogo />
      </div>
      <div class="mobile-only">
        <Drip height="1.5rem" />
      </div>
      <span>Wave</span>
    </a>
  </div>

  <div class="right">
    {#if user}
      <NotificationsButton {user} />
    {/if}

    <SupportButton {user} />

    {#if user}
      <Button href="/wave/points" variant="caution" size="small" icon={Trophy}>
        {pointsBalance ?? 0}
      </Button>

      <Flyout
        disabled={mobileMode}
        noPadding
        width="16rem"
        onclickWhileDisabled={handleMobileUserMenuClick}
      >
        {#snippet trigger()}
          <GithubUserBadge {user} size={32} link={false} hideName />
        {/snippet}

        {#snippet content()}
          <UserMenu {user} />
        {/snippet}
      </Flyout>
    {:else}
      <LogInButton />
    {/if}
  </div>
</header>

<style>
  .logo {
    height: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    line-height: 0;
    color: var(--color-primary);
  }

  .logo span {
    padding-top: 0.125rem;
  }

  header {
    height: 4.5rem;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    padding-bottom: 1rem;
    justify-content: space-between;
    background: linear-gradient(
      180deg,
      var(--color-background) 0%,
      var(--color-background) 80%,
      transparent 100%
    );
    view-transition-name: header;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  header.noBackground {
    background: transparent;
  }

  header .right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .mobile-only {
    display: none;
  }

  .desktop-only {
    display: block;
  }

  @media (max-width: 1024px) {
    header {
      height: 3.5rem;
      padding: 0 1rem 0.5rem 1rem;
    }

    header.noBackground {
      background: linear-gradient(
        180deg,
        var(--color-background) 0%,
        var(--color-background) 90%,
        transparent 100%
      );
    }

    .mobile-only {
      display: block;
    }

    .desktop-only {
      display: none;
    }
  }
</style>
