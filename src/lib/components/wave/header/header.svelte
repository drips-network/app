<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Flyout from '$lib/components/flyout/flyout.svelte';
  import DripsLogo from '$lib/components/header/drips-logo.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import SupportButton from '$lib/components/intercom/support-button.svelte';
  import NotificationsButton from '$lib/components/notifications/notifications-button.svelte';
  import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
  import GithubUserBadge from '../github-user-badge/github-user-badge.svelte';
  import LogInButton from '../log-in-button/log-in-button.svelte';
  import LogOutButton from '../log-out-button/log-out-button.svelte';

  let {
    user,
    pointsBalance,
    noBackground = false,
  }: {
    user: WaveLoggedInUser | null;
    pointsBalance: number | null;
    noBackground?: boolean;
  } = $props();
</script>

<header class:noBackground>
  <a class="typo-header-3 logo" href="/wave">
    <DripsLogo />
    <span>Wave</span>
  </a>

  <div class="right">
    {#if user}
      <NotificationsButton {user} />
    {/if}

    <SupportButton {user} />

    {#if user}
      <Button href="/wave/points" variant="caution" size="small" icon={Trophy}>
        {pointsBalance ?? 0}
      </Button>

      <Flyout>
        {#snippet trigger()}
          <GithubUserBadge {user} />
        {/snippet}

        {#snippet content()}
          <LogOutButton />
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

  header.noBackground {
    background: transparent;
  }

  header .right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>
