<script lang="ts">
  import type { GitProject } from '../project-badge.svelte';

  export let project: GitProject;
</script>

<span class="project-name">
  {#if project.source.type === 'github' || project.source.type === 'gitlab'}
    <span style:color="var(--color-foreground-level-5)">{project.source.ownerName}/</span><span
      class="repo-name">{project.source.repoName}</span
    >
  {:else}
    <span>{project.source.repoName}</span>
  {/if}
</span>

<style>
  .project-name {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
