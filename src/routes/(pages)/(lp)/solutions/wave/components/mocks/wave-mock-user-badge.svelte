<script lang="ts">
  import Registered from '$lib/components/icons/Registered.svelte';

  let {
    name,
    avatarUrl,
    verified = false,
    hideName = false,
    size = 24,
  }: {
    name: string;
    avatarUrl?: string;
    verified?: boolean;
    hideName?: boolean;
    size?: number;
  } = $props();
</script>

<div class="user-badge">
  {#if avatarUrl}
    <img class="avatar" src={avatarUrl} alt="" width={size} height={size} />
  {:else}
    <div class="avatar placeholder" style="width: {size}px; height: {size}px;">
      {name.slice(0, 1).toUpperCase()}
    </div>
  {/if}
  {#if !hideName}
    <span class="name typo-text">{name}</span>
  {/if}
  {#if verified}
    <Registered style="fill: var(--color-primary); width: 1rem; height: 1rem;" />
  {/if}
</div>

<style>
  .user-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .avatar {
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-primary-level-2);
    color: var(--color-primary-level-7);
    font-weight: 600;
    font-size: 0.75rem;
  }

  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
