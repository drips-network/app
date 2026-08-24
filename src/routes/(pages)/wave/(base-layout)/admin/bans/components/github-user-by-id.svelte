<script lang="ts">
  import { lookUpUser, type AdminUserLookupResult } from '$lib/utils/wave/admin/user-lookup';

  interface Props {
    gitHubUserId: number;
    /**
     * Pre-resolved GitHub username, when wave already knew it (i.e. the
     * banned user has a Wave account). When provided, no lookup happens.
     * Null means wave looked but found no Wave user (pre-emptive ban) —
     * resolve the username through the admin lookup endpoint instead.
     */
    gitHubUsername?: string | null;
  }

  let { gitHubUserId, gitHubUsername = null }: Props = $props();

  let user = $state<AdminUserLookupResult | null | undefined>(undefined);
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
    lookUpUser(fetch, String(gitHubUserId))
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

  const displayLogin = $derived(gitHubUsername ?? user?.gitHubUsername ?? null);
  const avatarUrl = $derived(
    user?.gitHubAvatarUrl ?? `https://avatars.githubusercontent.com/u/${gitHubUserId}?s=64`,
  );
  const profileUrl = $derived(displayLogin ? `https://github.com/${displayLogin}` : null);
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
