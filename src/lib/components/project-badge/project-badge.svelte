<script lang="ts">
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import ProjectTooltip from './components/project-tooltip.svelte';
  import ProjectName from './components/project-name.svelte';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import type { GitProject, UnclaimedGitProject } from '$lib/utils/project/types';
  import { ProjectVerificationStatus } from '$lib/graphql/generated/graphql';
  import { buildProjectUrl } from '$lib/utils/project/git-project-utils';

  export let project: GitProject;
  export let tooltip = true;
  export let forceUnclaimed = false;
  export let hideAvatar = false;
  export let linkToNewTab = false;
  export let linkTo: 'external-url' | 'project-page' | 'nothing' = 'project-page';

  let unclaimedProject: UnclaimedGitProject;
  $: unclaimedProject = {
    ...project,
    verificationStatus: ProjectVerificationStatus.Unclaimed,
  };

  $: processedProject = forceUnclaimed ? unclaimedProject : project;
</script>

<PrimaryColorThemer
  colorHex={processedProject.verificationStatus === ProjectVerificationStatus.Claimed
    ? processedProject.color
    : undefined}
>
  <Tooltip disabled={!tooltip}>
    <svelte:element
      this={linkTo === 'nothing' ? 'div' : 'a'}
      class="project-badge flex gap-2 items-center typo-text"
      href={linkTo === 'project-page'
        ? buildProjectUrl(project.forge, project.ownerName, project.repoName)
        : buildExternalUrl(processedProject.url)}
      target={linkTo === 'external-url' || linkToNewTab ? '_blank' : ''}
    >
      {#if !hideAvatar}
        <div class="avatar-and-forge">
          {#if !forceUnclaimed && project.verificationStatus === ProjectVerificationStatus.Claimed}
            <div>
              <ProjectAvatar project={unclaimedProject} />
            </div>
          {/if}
          <div><ProjectAvatar project={processedProject} /></div>
        </div>
      {/if}
      <div class="name flex-1 min-w-0 truncate">
        <ProjectName project={processedProject} />
      </div>
    </svelte:element>
    <svelte:fragment slot="tooltip-content">
      <ProjectTooltip project={processedProject} />
    </svelte:fragment>
  </Tooltip>
</PrimaryColorThemer>

<style>
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

  .avatar-and-forge {
    display: flex;
    flex-direction: row;
  }

  .avatar-and-forge > *:nth-child(2) {
    margin-left: -0.75rem;
  }
</style>
