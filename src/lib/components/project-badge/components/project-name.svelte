<script lang="ts">
  import type { GitProject } from '$lib/utils/metadata/types';

  export let showSource = true;

  export let project: GitProject;
</script>

<span class="project-name">
  {#if showSource}
    <span style:color="var(--color-foreground-level-5)" class="typo-text">
      {project.source.ownerName}/
    </span>
  {/if}
  <span class="repo-name typo-text-bold"
    >iwandfiouawbfuoahjwpofhibaeuogjaeopnfbiouabfpawndioandpawnpdo</span
  >
</span>

<style>
  .project-name {
    flex: 1 1 0;
    min-width: 0;
    display: inline-flex;
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .project-name .repo-name {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
