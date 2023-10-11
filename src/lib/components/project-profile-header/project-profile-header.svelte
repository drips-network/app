<script lang="ts">
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import type { GitProject } from '$lib/utils/project/types';
  import Copyable from '../copyable/copyable.svelte';

  export let project: GitProject;
</script>

<div class="project-profile-header">
  <div class="avatar">
    <ProjectAvatar {project} size="huge" />
  </div>
  <div class="name">
    <h1>{project.repoName}</h1>
    <Copyable alwaysVisible={true} value={project.url}>
      <ProjectBadge {project} forceUnclaimed tooltip={false} linkTo="external-url" />
    </Copyable>
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
