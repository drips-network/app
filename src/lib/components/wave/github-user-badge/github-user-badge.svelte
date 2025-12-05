<script lang="ts">
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import type { WaveUser } from '$lib/utils/wave/types/user';
  import type { ComponentProps } from 'svelte';

  let {
    user,
    link = true,
    size,
    hideName = false,
  }: {
    user: WaveUser;
    link?: boolean;
    size?: ComponentProps<typeof UserAvatar>['size'];
    hideName?: boolean;
  } = $props();
</script>

<svelte:element
  this={link ? 'a' : 'div'}
  class="github-user-badge"
  href="https://github.com/{user.gitHubUsername}"
  target="_blank"
  rel="noopener noreferrer"
>
  <UserAvatar {size} src={user.gitHubAvatarUrl} />
  {#if !hideName}
    <span class="typo-text">{user.gitHubUsername}</span>
  {/if}
</svelte:element>

<style>
  .github-user-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
