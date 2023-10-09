<script lang="ts">
  import type { GitProject } from '$lib/utils/git-project/types';

  export let showSource = true;

  export let project: GitProject;
</script>

<span class="text-foreground-level-5 typo-text"
  >{#if showSource}{project.ownerName}/{/if}<span class="text-foreground">{project.repoName}</span
  ></span
>
