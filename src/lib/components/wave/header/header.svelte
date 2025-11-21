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
  <h1 class="typo-header-3">Drips Wave</h1>

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
    height: 4rem;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    justify-content: space-between;
  }
</style>
