<script lang="ts" context="module">
  export const PROJECT_CARD_FRAGMENT = gql`
    ${PROJECT_AVATAR_FRAGMENT}
    ${PROJECT_NAME_FRAGMENT}
    ${MERGE_WITHDRAWABLE_BALANCES_FRAGMENT}
    fragment ProjectCard on Project {
      ...ProjectName
      isVisible
      source {
        forge
        ownerName
        repoName
        url
      }

      chainData {
        ... on ClaimedProjectData {
          description
          chain
          owner {
            accountId
            address
          }
          totalEarned {
            tokenAddress
            amount
          }
          splits {
            dependencies {
              __typename
            }
          }
        }
        ... on UnClaimedProjectData {
          chain
          owner {
            accountId
          }
          withdrawableBalances {
            ...MergeWithdrawableBalances
          }
        }
        ...ProjectAvatar
      }
    }
  `;
</script>

<script lang="ts">
  import buildProjectUrl from '$lib/utils/build-project-url';
  import ProjectAvatar, { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
  import ProjectName, {
    PROJECT_NAME_FRAGMENT,
  } from '../project-badge/components/project-name.svelte';
  import { gql } from 'graphql-request';
  import type { ProjectCardFragment } from './__generated__/gql.generated';
  import isClaimed from '$lib/utils/project/is-claimed';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import ProjectBadge from '../project-badge/project-badge.svelte';
  import CoinFlying from '../icons/CoinFlying.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import ChevronRight from '../icons/ChevronRight.svelte';
  import mergeWithdrawableBalances, {
    MERGE_WITHDRAWABLE_BALANCES_FRAGMENT,
  } from '$lib/utils/merge-withdrawable-balances';
  import formatNumber from '$lib/utils/format-number';

  export let project: ProjectCardFragment;
  export let isHidden = false;

  let projectChainData = filterCurrentChainData(project.chainData);
</script>

<a
  class="wrapper"
  href={buildProjectUrl(project.source.forge, project.source.ownerName, project.source.repoName)}
>
  <div class="project-card" class:hidden-project={isHidden}>
    <div
      class="background"
      style:background-color={isClaimed(projectChainData)
        ? 'var(--color-primary-level-2)'
        : 'var(--color-foreground-level-1)'}
    >
      <ChevronRight style="fill: var(--color-foreground)" />
    </div>
    <div class="header">
      <div class="avatar">
        <ProjectAvatar project={projectChainData} size="large" outline />
      </div>
    </div>
    <div class="name-and-description">
      <h2 class="name pixelated">
        <ProjectName pixelated showSource={false} {project} />
      </h2>
      <ProjectBadge
        forceUnclaimed
        smallText
        tooltip={false}
        linkTo="project-page"
        linkToNewTab
        size="tiny"
        {project}
      />
      <!-- TODO: Add descriptions to product cards · Issue #1579 -->
      <!-- {#if projectChainData.description}
        <p class="typo-text-small line-clamp-2">{projectChainData.description}</p>
      {/if} -->
    </div>
    <div class="cubbies">
      {#if isClaimed(projectChainData)}
        <div>
          <CoinFlying style="fill: var(--color-foreground)" />
          <span class="cubby-label typo-bold">Funds</span>
          <AggregateFiatEstimate
            supressUnknownAmountsWarning
            amounts={projectChainData.totalEarned}
          />
        </div>
        <div>
          <DripListIcon style="fill: var(--color-foreground)" />
          <span class="cubby-label typo-bold">Dependencies</span>
          {formatNumber(projectChainData.splits.dependencies.length)}
        </div>
      {:else}
        <div>
          <CoinFlying style="fill: var(--color-foreground)" />
          <span class="cubby-label typo-bold">Funds</span>
          <AggregateFiatEstimate
            amounts={mergeWithdrawableBalances(projectChainData.withdrawableBalances)}
          />
        </div>
      {/if}
    </div>
  </div>
</a>

<style>
  .wrapper {
    padding: 2px 0;
    margin: -2px 0;
  }

  .project-card {
    box-shadow: var(--elevation-low);
    border-radius: 1rem 0 1rem 1rem;
    padding: 1rem 0.75rem 0.75rem 0.75rem;
    position: relative;
    gap: 1rem;
    display: flex;
    flex-direction: column;
    transition:
      box-shadow 0.2s,
      backgorund-color 0.2s,
      transform 0.2s;
    container-name: wrapper;
    container-type: inline-size;
    overflow: hidden;
  }

  .wrapper:hover:not(:active) .project-card,
  .wrapper:focus-visible .project-card {
    box-shadow: var(--elevation-medium);
    transform: translateY(-2px);
  }

  .wrapper:focus-visible {
    outline: none;
    background-color: var(--color-foreground-level-1);
  }

  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3rem;
    border-radius: 1rem 0 0 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 0.75rem;
  }

  .name-and-description {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    justify-content: center;
  }

  .hidden-project {
    color: var(--color-foreground);
    opacity: 0;
    animation: fadeIn 1s ease forwards;
  }

  .cubbies {
    display: flex;
    align-items: center;
    border-top: 1px solid var(--color-foreground-level-2);
    position: relative;
    left: -0.75rem;
    top: 0.75rem;
    width: calc(100% + 1.5rem);
    margin-top: -0.75rem;
  }

  .cubbies > * {
    flex-grow: 1;
    border-right: 1px solid var(--color-foreground-level-2);
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-basis: 50%;
    gap: 0.25rem;
  }

  .cubbies > *:last-child {
    border-right: none;
  }

  .cubby-label {
    display: none;
  }

  @keyframes fadeIn {
    to {
      opacity: 0.3;
    }
  }

  @container wrapper (width > 30rem) {
    .cubby-label {
      display: inline;
    }
  }
</style>
