<script lang="ts" context="module">
  import type { ProjectBadgeFragment } from './__generated__/gql.generated';
  import { gql } from 'graphql-request';
  import { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
  import { PROJECT_TOOLTIP_FRAGMENT } from './components/project-tooltip.svelte';

  export const PROJECT_BADGE_FRAGMENT = gql`
    ${PROJECT_AVATAR_FRAGMENT}
    ${PROJECT_TOOLTIP_FRAGMENT}
    fragment ProjectBadge on Project {
      ...ProjectTooltip
      source {
        url
        forge
        ownerName
        repoName
      }
      isVisible
      chainData {
        ...ProjectAvatar
        ... on ClaimedProjectData {
          chain
          owner {
            address
          }
        }
      }
    }
  `;
</script>

<script lang="ts">
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import ProjectTooltip from './components/project-tooltip.svelte';
  import ProjectName from './components/project-name.svelte';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import isClaimed from '$lib/utils/project/is-claimed';
  import { ProjectVerificationStatus, type Project } from '$lib/graphql/__generated__/base-types';
  import network from '$lib/stores/wallet/network';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import WarningIcon from '$lib/components/icons/ExclamationCircle.svelte';

  export let project: ProjectBadgeFragment;

  export let tooltip = true;
  export let forceUnclaimed = false;
  export let hideAvatar = false;
  export let linkToNewTab = false;
  export let linkTo: 'external-url' | 'project-page' | 'nothing' = 'project-page';
  export let size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' = 'small';

  let unclaimedProject: Project;
  $: unclaimedProject = {
    source: { ...project.source },
    chainData: [
      {
        chain: network.gqlName,
        __typename: 'UnClaimedProjectData',
        verificationStatus: ProjectVerificationStatus.Unclaimed,
      },
    ],
  } as Project;

  $: processedProject = forceUnclaimed ? unclaimedProject : project;

  $: chainData = filterCurrentChainData(processedProject.chainData);
</script>

<PrimaryColorThemer colorHex={isClaimed(chainData) ? chainData.color : undefined}>
  <Tooltip disabled={!tooltip}>
    <svelte:element
      this={linkTo === 'nothing' ? 'div' : 'a'}
      class="project-badge flex gap-2 items-center typo-text"
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
          {#if !forceUnclaimed && isClaimed(chainData)}
            <div>
              <ProjectAvatar {size} project={filterCurrentChainData(unclaimedProject.chainData)} />
            </div>
          {/if}
          <div><ProjectAvatar {size} project={chainData} /></div>
        </div>
      {/if}
      <div class="name flex-1 min-w-0 truncate" class:hiddenProject={!processedProject.isVisible}>
        <ProjectName project={processedProject} />
      </div>
      {#if !project?.isVisible}
        <WarningIcon
          style="height: 1.25rem; width: 1.25rem; fill: var(--color-caution-level-6); display:inline"
        />
      {/if}
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

  .hiddenProject {
    opacity: 0.3;
  }
</style>
