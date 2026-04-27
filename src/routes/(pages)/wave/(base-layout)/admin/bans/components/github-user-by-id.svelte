<script lang="ts">
  import { lookupGitHubUserById, type GitHubUser } from '$lib/utils/github/lookup-user';

  interface Props {
    gitHubUserId: number;
  }

  let { gitHubUserId }: Props = $props();

  let user = $state<GitHubUser | null | undefined>(undefined);
  let error = $state<string | null>(null);

  $effect(() => {
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
</script>

<div class="user">
  <img class="avatar" src={avatarUrl} alt="" referrerpolicy="no-referrer" />
  <div class="info">
    {#if user === undefined}
      <span class="login typo-text-bold">…</span>
      <span class="id typo-text-small dim">#{gitHubUserId}</span>
    {:else if user === null}
      <span class="login typo-text-bold">Unknown</span>
      <span class="id typo-text-small dim" title={error ?? undefined}>#{gitHubUserId}</span>
    {:else}
      <a class="login typo-text-bold" href={user.htmlUrl} target="_blank" rel="noreferrer">
        {user.login}
      </a>
      <span class="id typo-text-small dim">#{gitHubUserId}</span>
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
