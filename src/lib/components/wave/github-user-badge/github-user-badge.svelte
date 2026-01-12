<script lang="ts">
  import Registered from '$lib/components/icons/Registered.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import type { WaveUser } from '$lib/utils/wave/types/user';
  import type { ComponentProps } from 'svelte';

  let {
    user,
    link = true,
    size,
    hideName = false,
    verifiedBadge = false,
  }: {
    user: WaveUser;
    link?: boolean;
    size?: ComponentProps<typeof UserAvatar>['size'];
    hideName?: boolean;
    verifiedBadge?: boolean;
  } = $props();
</script>

<svelte:element this={link ? 'a' : 'div'} class="github-user-badge" href="/wave/users/{user.id}">
  <UserAvatar {size} src={user.gitHubAvatarUrl} />
  {#if !hideName}
    <span class="name typo-text">{user.gitHubUsername}</span>
  {/if}
  {#if verifiedBadge}
    <Tooltip>
      <Registered style="fill: var(--color-primary-level-6)" />

      {#snippet tooltip_content()}
        Successfully verified their identity on Drips Wave
      {/snippet}
    </Tooltip>
  {/if}
</svelte:element>

<style>
  .github-user-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .name {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
