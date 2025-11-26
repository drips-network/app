<script lang="ts">
  import Flyout from '$lib/components/flyout/flyout.svelte';
  import type { WaveUser } from '$lib/utils/wave/types/user';
  import GithubUserBadge from '../github-user-badge/github-user-badge.svelte';
  import LogInButton from '../log-in-button/log-in-button.svelte';
  import LogOutButton from '../log-out-button/log-out-button.svelte';

  let {
    user,
  }: {
    user: WaveUser | null;
  } = $props();
</script>

<header>
  <a class="typo-header-3" href="/wave">Drips Wave</a>

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
</style>
