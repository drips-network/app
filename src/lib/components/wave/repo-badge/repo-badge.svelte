<script lang="ts">
  import Github from '$lib/components/icons/Github.svelte';
  import type { Repo } from '$lib/utils/wave/types/repo';

  let { repo }: { repo: Repo } = $props();
</script>

<div class="repo-badge">
  <Github style="height: 1rem; width: 1rem;" />
  <span class="typo-text-small">{repo.gitHubRepoFullName}</span>
</div>

<style>
  .repo-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
</style>
