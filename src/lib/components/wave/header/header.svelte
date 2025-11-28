<script lang="ts">
  import Flyout from '$lib/components/flyout/flyout.svelte';
  import SupportButton from '$lib/components/intercom/support-button.svelte';
  import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
  import GithubUserBadge from '../github-user-badge/github-user-badge.svelte';
  import LogInButton from '../log-in-button/log-in-button.svelte';
  import LogOutButton from '../log-out-button/log-out-button.svelte';

  let {
    user,
    noBackground = false,
  }: {
    user: WaveLoggedInUser | null;
    noBackground?: boolean;
  } = $props();
</script>

<header class:noBackground>
  <a class="typo-header-3" href="/wave">Drips Wave</a>

  <div class="right">
    <SupportButton {user} />

    {#if user}
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
