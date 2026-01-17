<script lang="ts">
  import GithubIcon from '$lib/components/icons/Github.svelte';

  let {
    repo,
    size = 'normal',
    clamp = true,
    avatarUrl,
  }: {
    repo: {
      gitHubRepoFullName: string;
    };
    avatarUrl?: string;
    size?: 'normal' | 'small';
    clamp?: boolean;
  } = $props();

  const IMAGE_SIZES = {
    small: 24,
    normal: 32,
  };
</script>

<div class="repo-badge">
  {#if avatarUrl}
    <img
      class="repo-avatar"
      src={avatarUrl}
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
</div>

<style>
  .repo-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
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
