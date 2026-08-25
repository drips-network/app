<script lang="ts">
  interface Props {
    gitHubUserId: number;
    /**
     * GitHub username as wave resolved it from our own records. Null when the
     * banned account has never signed up to Wave (i.e. a pre-emptive ban), in
     * which case we only know the numeric ID. We deliberately don't resolve
     * the username through the admin lookup endpoint here: that falls back to
     * the GitHub API, and one call per row burns through the admin's rate
     * limit for a list that can be hundreds of entries long.
     */
    gitHubUsername?: string | null;
  }

  let { gitHubUserId, gitHubUsername = null }: Props = $props();

  // The avatar CDN resolves by user ID and isn't rate-limited, so it works
  // even for users we only know the ID of.
  const avatarUrl = $derived(`https://avatars.githubusercontent.com/u/${gitHubUserId}?s=64`);
  const profileUrl = $derived(gitHubUsername ? `https://github.com/${gitHubUsername}` : null);
</script>

<div class="user">
  <img class="avatar" src={avatarUrl} alt="" referrerpolicy="no-referrer" />
  <div class="info">
    {#if gitHubUsername && profileUrl}
      <a class="login typo-text-bold" href={profileUrl} target="_blank" rel="noreferrer">
        {gitHubUsername}
      </a>
    {:else}
      <span class="login typo-text-bold" title="This account has never signed up to Wave.">
        Unknown
      </span>
    {/if}
    <span class="id typo-text-small dim">#{gitHubUserId}</span>
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
