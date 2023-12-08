<script lang="ts" context="module">
  import type {
    ProjectBadgeFragment,
    ProjectBadge_UnclaimedProject_Fragment,
  } from './__generated__/gql.generated';
  import { gql } from 'graphql-request';

  export const PROJECT_BADGE_FRAGMENT = gql`
    ${PROJECT_AVATAR_FRAGMENT}
    ${PROJECT_TOOLTIP_FRAGMENT}
    fragment ProjectBadge on Project {
      ...ProjectAvatar
      ...ProjectTooltip
      ... on ClaimedProject {
        owner {
          address
        }
        source {
          url
          forge
          ownerName
          repoName
        }
      }
      ... on UnclaimedProject {
        source {
          url
          ownerName
          repoName
          forge
        }
      }
    }
  `;
</script>

<script lang="ts">
  import ProjectAvatar, {
    PROJECT_AVATAR_FRAGMENT,
  } from '$lib/components/project-avatar/project-avatar.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import ProjectTooltip, { PROJECT_TOOLTIP_FRAGMENT } from './components/project-tooltip.svelte';
  import ProjectName from './components/project-name.svelte';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import isClaimed from '$lib/utils/project/is-claimed';
  import { ProjectVerificationStatus } from '$lib/graphql/__generated__/base-types';

  export let project: ProjectBadgeFragment;

  export let tooltip = true;
  export let forceUnclaimed = false;
  export let hideAvatar = false;
  export let linkToNewTab = false;
  export let linkTo: 'external-url' | 'project-page' | 'nothing' = 'project-page';
  export let maxWidth: number | false = 320;
  export let size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' = 'small';

  let unclaimedProject: ProjectBadge_UnclaimedProject_Fragment;
  $: unclaimedProject = {
    __typename: 'UnclaimedProject',
    source: { ...project.source },
    verificationStatus: ProjectVerificationStatus.Unclaimed,
  };

  $: processedProject = forceUnclaimed ? unclaimedProject : project;
</script>

<PrimaryColorThemer colorHex={isClaimed(processedProject) ? processedProject.color : undefined}>
  <Tooltip disabled={!tooltip}>
    <svelte:element
      this={linkTo === 'nothing' ? 'div' : 'a'}
      class="project-badge flex gap-2 items-center typo-text"
      style:max-width={maxWidth ? maxWidth + 'px' : 'none'}
      href={linkTo === 'project-page'
        ? buildProjectUrl(
            processedProject.source.forge,
            processedProject.source.ownerName,
            processedProject.source.repoName,
          )
        : buildExternalUrl(processedProject.source.url)}
      target={linkTo === 'external-url' || linkToNewTab ? '_blank' : ''}
    >
      {#if !hideAvatar}
        <div class="avatar-and-forge">
          {#if !forceUnclaimed && isClaimed(processedProject)}
            <div>
              <ProjectAvatar {size} project={unclaimedProject} />
            </div>
          {/if}
          <div><ProjectAvatar {size} project={processedProject} /></div>
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
