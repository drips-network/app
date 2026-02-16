<script lang="ts">
  import GithubIcon from '$lib/components/icons/Github.svelte';

  let {
    repo,
    size = 'normal',
    clamp = true,
    avatarUrl,
    href,
  }: {
    repo: {
      gitHubRepoFullName: string;
    };
    avatarUrl?: string;
    size?: 'normal' | 'small';
    clamp?: boolean;
    href?: string;
  } = $props();

  const IMAGE_SIZES = {
    small: 24,
    normal: 32,
  };

  const GITHUB_AVATAR_REGEX = /^https:\/\/avatars\.githubusercontent\.com\/u\/(\d+)/;

  const resolvedAvatarUrl = $derived.by(() => {
    if (!avatarUrl) return undefined;

    const match = avatarUrl.match(GITHUB_AVATAR_REGEX);

    if (match) {
      const userId = match[1];
      return `/api/github-avatars/${userId}?size=100`;
    }

    return avatarUrl;
  });
</script>

{#if href}
  <a class="repo-badge" {href} target="_blank" rel="noopener noreferrer">
    {@render content()}
  </a>
{:else}
  <div class="repo-badge">
    {@render content()}
  </div>
{/if}

{#snippet content()}
  {#if resolvedAvatarUrl}
    <img
      class="repo-avatar"
      src={resolvedAvatarUrl}
      alt="Repo Avatar"
      width={IMAGE_SIZES[size]}
      height={IMAGE_SIZES[size]}
    />
  {:else}
    <div
      class="repo-avatar placeholder"
      style="width: {IMAGE_SIZES[size]}px; height: {IMAGE_SIZES[size]}px;"
    >
      <GithubIcon style="width: 75%; height: 75%;" />
    </div>
  {/if}
  <span class={size === 'small' ? 'typo-text-small' : 'typo-text'} class:line-clamp-1={clamp}
    >{repo.gitHubRepoFullName}</span
  >
{/snippet}

<style>
  .repo-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
    color: inherit;
    text-decoration: none;
  }

  .repo-avatar {
    border-radius: 50%;
    object-fit: cover;
  }

  .repo-avatar.placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-foreground-level-2);
  }
</style>
