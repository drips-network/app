<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { WaveLoggedInUser } from '$lib/utils/wave/auth';
  import GithubUserBadge from '../../github-user-badge/github-user-badge.svelte';
  import LogOutButton from '../../log-out-button/log-out-button.svelte';

  let { user }: { user: WaveLoggedInUser } = $props();
</script>

<div class="user-flyout">
  <div class="profile-info">
    <div class="bg"></div>
    <GithubUserBadge {user} size={64} link={false} hideName />
    <span class="typo-header-3">{user.name}</span>
    <span class="typo-text-small" style:color="var(--color-foreground-level-5)">{user.email}</span>
  </div>

  <div class="actions">
    <Button href="/wave/settings">Settings</Button>
    <LogOutButton />
  </div>
</div>

<style>
  .user-flyout {
    position: relative;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-flyout .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-flyout .profile-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    min-width: 0;
  }

  .user-flyout .profile-info > * {
    min-width: 0;
    width: 100%;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-flyout .profile-info .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3rem;
    background-color: var(--color-primary-level-1);
    border-radius: 0.5rem 0.5rem 0 0;
  }
</style>
