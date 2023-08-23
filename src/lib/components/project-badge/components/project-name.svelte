<script lang="ts">
  import type { GitProject } from '$lib/utils/metadata/types';

  export let showSource = true;

  export let project: GitProject;
</script>

<span class="text-foreground-level-5 typo-text"
  >{#if showSource}{project.source.ownerName}/{/if}<span class="text-foreground"
    >{project.source.repoName}</span
  ></span
>
