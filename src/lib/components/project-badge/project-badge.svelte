<script lang="ts">
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import ProjectTooltip from './components/project-tooltip.svelte';
  import ProjectName from './components/project-name.svelte';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import {
    VerificationStatus,
    type GitProject,
    type UnclaimedGitProject,
  } from '$lib/utils/metadata/types';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import Copyable from '../copyable/copyable.svelte';

  export let project: GitProject;
  export let tooltip = true;
  export let forceUnclaimed = false;
  export let hideAvatar = false;
  export let linkToNewTab = false;
  export let urlCopyable = false;
  export let linkTo: 'external-url' | 'project-page' | 'nothing' = 'project-page';

  let unclaimedProject: UnclaimedGitProject;
  $: unclaimedProject = {
    ...project,
    owner: undefined,
    color: undefined,
    description: undefined,
    emoji: undefined,
    claimed: false,
    verificationStatus: VerificationStatus.NOT_STARTED,
  };

  $: processedProject = forceUnclaimed ? unclaimedProject : project;
</script>

<div class="wrapper">
  <PrimaryColorThemer colorHex={processedProject.claimed ? processedProject.color : undefined}>
    <Tooltip disabled={!tooltip}>
      <Copyable alwaysVisible={urlCopyable} disabled={!urlCopyable} value={project.source.url}>
        <svelte:element
          this={linkTo === 'nothing' ? 'div' : 'a'}
          class="project-badge"
          href={linkTo === 'project-page'
            ? buildProjectUrl(project.source)
            : buildExternalUrl(processedProject.source.url)}
          target={linkTo === 'external-url' || linkToNewTab ? '_blank' : ''}
        >
          {#if !hideAvatar}<div class="avatar-and-forge">
              {#if !forceUnclaimed && project.claimed}
                <div>
                  <ProjectAvatar project={unclaimedProject} />
                </div>
              {/if}
              <div><ProjectAvatar project={processedProject} /></div>
            </div>{/if}
          <div class="name">
            <ProjectName project={processedProject} />
          </div>
        </svelte:element>
      </Copyable>
      <svelte:fragment slot="tooltip-content">
        <ProjectTooltip project={processedProject} />
      </svelte:fragment>
    </Tooltip>
  </PrimaryColorThemer>
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

  .avatar-and-forge {
    display: flex;
    flex-direction: row;
  }

  .avatar-and-forge > *:nth-child(2) {
    margin-left: -0.75rem;
  }
</style>
