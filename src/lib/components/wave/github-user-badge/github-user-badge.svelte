<script lang="ts">
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import type { WaveUser } from '$lib/utils/wave/types/user';

  let { user }: { user: WaveUser } = $props();
</script>

<a
  class="github-user-badge"
  href="https://github.com/{user.gitHubUsername}"
  target="_blank"
  rel="noopener noreferrer"
>
  <UserAvatar src={user.gitHubAvatarUrl} />
  <span class="typo-text">{user.gitHubUsername}</span>
</a>

<style>
  .github-user-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
