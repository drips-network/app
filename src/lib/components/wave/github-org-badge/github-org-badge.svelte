<script lang="ts">
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import type { Org } from '$lib/utils/wave/types/org';

  let {
    org,
    displayPersonalBadge = false,
    size = 'normal',
  }: { org: Org; displayPersonalBadge: boolean; size?: 'normal' | 'small' } = $props();
</script>

<a
  class="github-org-badge"
  href="https://github.com/{org.gitHubOrgLogin}"
  target="_blank"
  rel="noopener noreferrer"
>
  <UserAvatar size={size === 'small' ? 24 : 32} src={org.gitHubOrgAvatarUrl} />
  <span class={size === 'small' ? 'typo-text-small' : 'typo-text'}>{org.gitHubOrgLogin}</span>
  {#if displayPersonalBadge && org.accountType === 'User'}
    <span class="personal-badge typo-text-small">Personal account</span>
  {/if}
</a>

<style>
  .github-org-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 0;
    overflow: hidden;
  }

  .personal-badge {
    padding: 0.1rem 0.4rem;
    border-radius: 1rem 0 1rem 1rem;
    background-color: var(--color-foreground-level-2);
    color: var(--color-foreground-level-6);
    font-size: 0.75rem;
    font-weight: 500;
  }

  span {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
