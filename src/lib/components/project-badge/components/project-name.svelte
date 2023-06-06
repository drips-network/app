<script lang="ts">
  import type { GitProject } from '$lib/utils/metadata/types';

  export let project: GitProject;
</script>

<span class="project-name">
  {#if project.source.forge === 'github' || project.source.forge === 'gitlab'}
    <span style:color="var(--color-foreground-level-5)" class="typo-text"
      >{project.source.ownerName}/</span
    ><span class="repo-name typo-text-bold">{project.source.repoName}</span>
  {:else}
    <span class="typo-text-bold">{project.source.repoName}</span>
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
