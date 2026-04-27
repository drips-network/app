<script lang="ts">
  import { lookupGitHubUserById, type GitHubUser } from '$lib/utils/github/lookup-user';

  interface Props {
    gitHubUserId: number;
    /**
     * Pre-resolved GitHub username, when wave already knew it (i.e. the
     * banned user has a Wave account). When provided, no GitHub API
     * lookup happens. Null means wave looked but found no Wave user
     * (pre-emptive ban) — fall back to the unauthenticated GitHub API.
     */
    gitHubUsername?: string | null;
  }

  let { gitHubUserId, gitHubUsername = null }: Props = $props();

  let user = $state<GitHubUser | null | undefined>(undefined);
  let error = $state<string | null>(null);

  $effect(() => {
    if (gitHubUsername) {
      user = null;
      error = null;
      return;
    }

    let cancelled = false;
    user = undefined;
    error = null;
    lookupGitHubUserById(gitHubUserId)
      .then((u) => {
        if (!cancelled) user = u;
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          user = null;
          error = e instanceof Error ? e.message : 'Lookup failed.';
        }
      });
    return () => {
      cancelled = true;
    };
  });

  const avatarUrl = $derived(
    user?.avatarUrl ?? `https://avatars.githubusercontent.com/u/${gitHubUserId}?s=64`,
  );
  const profileUrl = $derived(
    user?.htmlUrl ?? (gitHubUsername ? `https://github.com/${gitHubUsername}` : null),
  );
  const displayLogin = $derived(gitHubUsername ?? user?.login ?? null);
</script>

<div class="user">
  <img class="avatar" src={avatarUrl} alt="" referrerpolicy="no-referrer" />
  <div class="info">
    {#if displayLogin}
      {#if profileUrl}
        <a class="login typo-text-bold" href={profileUrl} target="_blank" rel="noreferrer">
          {displayLogin}
        </a>
      {:else}
        <span class="login typo-text-bold">{displayLogin}</span>
      {/if}
      <span class="id typo-text-small dim">#{gitHubUserId}</span>
    {:else if user === undefined}
      <span class="login typo-text-bold">…</span>
      <span class="id typo-text-small dim">#{gitHubUserId}</span>
    {:else}
      <span class="login typo-text-bold">Unknown</span>
      <span class="id typo-text-small dim" title={error ?? undefined}>#{gitHubUserId}</span>
    {/if}
  </div>
</div>

<style>
  .user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--color-foreground-level-2);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .login {
    color: var(--color-foreground);
    text-decoration: none;
  }

  a.login:hover {
    text-decoration: underline;
  }

  .dim {
    color: var(--color-foreground-level-5);
    font-family: var(--typeface-mono);
  }
</style>
