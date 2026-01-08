<script lang="ts">
  import EmojiOrIpfsAvatar from '$lib/components/emoji-or-ipfs-avatar/EmojiOrIpfsAvatar.svelte';
  import GithubIcon from '$lib/components/icons/Github.svelte';

  let {
    repo,
    size = 'normal',
    clamp = true,
  }: {
    repo: {
      gitHubRepoFullName: string;
    };
    size?: 'normal' | 'small';
    clamp?: boolean;
  } = $props();
</script>

<div class="repo-badge">
  <EmojiOrIpfsAvatar size={size === 'small' ? 'tiny' : undefined} placeholderIcon={GithubIcon} />
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
</style>
