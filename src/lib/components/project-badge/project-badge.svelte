<script lang="ts" module>
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
  import {
    ProjectVerificationStatus,
    SupportedChain,
    type Project,
  } from '$lib/graphql/__generated__/base-types';
  import network from '$lib/stores/wallet/network';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import WarningIcon from '$lib/components/icons/ExclamationCircle.svelte';

  interface Props {
    project: ProjectBadgeFragment;
    tooltip?: boolean;
    /** display project as if it's unclaimed, even if it is claimed */
    forceUnclaimed?: boolean;
    hideAvatar?: boolean;
    hideName?: boolean;
    linkToNewTab?: boolean;
    linkTo?: 'external-url' | 'project-page' | 'nothing';
    size?: 'tiny' | 'small' | 'medium' | 'large' | 'huge';
    smallText?: boolean;
    chainOverride?: SupportedChain | undefined;
  }

  let {
    project,
    tooltip = true,
    forceUnclaimed = false,
    hideAvatar = false,
    hideName = false,
    linkToNewTab = false,
    linkTo = 'project-page',
    size = 'small',
    smallText = false,
    chainOverride = undefined,
  }: Props = $props();

  let unclaimedProject: Project = $derived({
    source: { ...project.source },
    chainData: [
      {
        chain: chainOverride ?? network.gqlName,
        __typename: 'UnClaimedProjectData',
        verificationStatus: ProjectVerificationStatus.Unclaimed,
      },
    ],
  } as Project);

  let processedProject = $derived(forceUnclaimed ? unclaimedProject : project);

  let chainData = $derived(
    filterCurrentChainData(processedProject.chainData, undefined, chainOverride),
  );
</script>

<PrimaryColorThemer colorHex={isClaimed(chainData) ? chainData.color : undefined}>
  <Tooltip disabled={!tooltip}>
    <svelte:element
      this={linkTo === 'nothing' ? 'div' : 'a'}
      class="project-badge gap-{smallText ? 1 : 2} flex items-center typo-text"
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
              <ProjectAvatar
                {size}
                project={filterCurrentChainData(
                  unclaimedProject.chainData,
                  undefined,
                  chainOverride,
                )}
              />
            </div>
          {/if}
          <div><ProjectAvatar {size} project={chainData} /></div>
        </div>
      {/if}
      {#if !hideName}
        <div class="name flex-1 min-w-0 truncate">
          <ProjectName tiny={smallText} project={processedProject} />
        </div>
      {/if}
      {#if !project?.isVisible}
        <WarningIcon
          style="height: 1.25rem; width: 1.25rem; fill: var(--color-foreground-level-4); display:inline"
        />
      {/if}
    </svelte:element>
    {#snippet tooltip_content()}
      <ProjectTooltip project={processedProject} />
    {/snippet}
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
