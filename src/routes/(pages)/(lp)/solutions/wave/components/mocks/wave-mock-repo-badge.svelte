<script lang="ts">
  import GithubIcon from '$lib/components/icons/Github.svelte';

  let {
    name,
    avatarUrl,
    size = 'small',
  }: {
    name: string;
    avatarUrl?: string;
    size?: 'tiny' | 'small' | 'normal';
  } = $props();

  const SIZES = { tiny: 16, small: 24, normal: 32 } as const;
</script>

<div class="repo-badge">
  {#if avatarUrl}
    <img class="avatar" src={avatarUrl} alt="" width={SIZES[size]} height={SIZES[size]} />
  {:else}
    <div class="avatar placeholder" style="width: {SIZES[size]}px; height: {SIZES[size]}px;">
      <GithubIcon style="width: 75%; height: 75%;" />
    </div>
  {/if}
  <span class={size === 'normal' ? 'typo-text' : 'typo-text-small'}>{name}</span>
</div>

<style>
  .repo-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
    min-width: 0;
  }

  .avatar {
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .avatar.placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-foreground-level-2);
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
