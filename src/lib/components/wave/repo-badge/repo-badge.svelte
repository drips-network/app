<script lang="ts">
  import EmojiOrIpfsAvatar from '$lib/components/emoji-or-ipfs-avatar/EmojiOrIpfsAvatar.svelte';
  import type { Repo } from '$lib/utils/wave/types/repo';
  import GithubIcon from '$lib/components/icons/Github.svelte';

  let { repo, size = 'normal' }: { repo: Repo; size?: 'normal' | 'small' } = $props();
</script>

<div class="repo-badge">
  <EmojiOrIpfsAvatar size={size === 'small' ? 'tiny' : undefined} placeholderIcon={GithubIcon} />
  <span class="{size === 'small' ? 'typo-text-small' : 'typo-text'} line-clamp-1"
    >{repo.gitHubRepoFullName}</span
  >
</div>

<style>
  .repo-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
</style>
