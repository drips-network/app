<script lang="ts">
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import type { GitProject } from '$lib/utils/metadata/types';

  export let project: GitProject;
</script>

<div class="project-profile-header">
  <div class="avatar">
    <ProjectAvatar {project} size="huge" />
  </div>
  <div class="name">
    <h1>{project.source.repoName}</h1>
    <ProjectBadge urlCopyable {project} forceUnclaimed tooltip={false} linkTo="external-url" />
  </div>
</div>

<style>
  .project-profile-header {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .name {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  @media (max-width: 577px) {
    .project-profile-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
  }
</style>
