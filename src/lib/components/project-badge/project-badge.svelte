<script lang="ts">
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import ProjectTooltip from './components/project-tooltip.svelte';
  import ProjectName from './components/project-name.svelte';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import type { GitProject } from '$lib/utils/metadata/types';

  export let project: GitProject;
  export let tooltip = true;
  export let forceUnclaimed = false;
  export let hideAvatar = false;
  export let linkTo: 'external-url' | 'project-page' = 'project-page';

  let processedProject: GitProject;
  $: processedProject = forceUnclaimed
    ? {
        ...project,
        owner: undefined,
        color: undefined,
        description: undefined,
        emoji: undefined,
        claimed: false,
      }
    : project;
</script>

<div class="wrapper">
  <Tooltip disabled={!tooltip}>
    <a
      class="project-badge"
      href={linkTo === 'project-page'
        ? buildProjectUrl(project.source)
        : buildExternalUrl(processedProject.source.url)}
      target={linkTo === 'project-page' ? '' : '_blank'}
    >
      {#if !hideAvatar}<ProjectAvatar project={processedProject} />{/if}
      <div class="name">
        <ProjectName project={processedProject} />
      </div>
    </a>
    <svelte:fragment slot="tooltip-content">
      <ProjectTooltip project={processedProject} />
    </svelte:fragment>
  </Tooltip>
</div>

<style>
  .wrapper {
    width: fit-content;
  }

  a:focus-visible {
    outline: none;
  }

  a .name {
    transition: background-color 0.3s ease;
  }

  a:focus-visible .name {
    background-color: var(--color-primary-level-1);
    border-radius: 0.25rem;
  }

  .project-badge {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .name {
    display: flex;
    min-width: 0;
  }
</style>
