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

      <Flyout noPadding width="16rem">
        {#snippet trigger()}
          <GithubUserBadge {user} size={32} link={false} hideName />
        {/snippet}

        {#snippet content()}
          <div class="user-flyout">
            <div class="profile-info">
              <div class="bg"></div>
              <GithubUserBadge {user} size={64} link={false} hideName />
              <span class="typo-header-3">{user.name}</span>
              <span class="typo-text-small" style:color="var(--color-foreground-level-5)"
                >{user.email}</span
              >
            </div>

            <div class="actions">
              <Button href="/wave/settings">Settings</Button>
              <LogOutButton />
            </div>
          </div>
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

  .user-flyout {
    position: relative;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-flyout .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-flyout .profile-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    min-width: 0;
  }

  .user-flyout .profile-info > * {
    min-width: 0;
    width: 100%;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-flyout .profile-info .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3rem;
    background-color: var(--color-primary-level-1);
    border-radius: 0.5rem 0.5rem 0 0;
  }
</style>
