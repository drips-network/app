<script lang="ts" context="module">
  export const PROJECT_CARD_FRAGMENT = gql`
    ${PROJECT_AVATAR_FRAGMENT}
    ${PROJECT_NAME_FRAGMENT}
    fragment ProjectCard on Project {
      ...ProjectName
      isVisible
      source {
        forge
        ownerName
        repoName
      }
      chainData {
        ... on ClaimedProjectData {
          chain
          owner {
            accountId
          }
        }
        ... on UnClaimedProjectData {
          chain
          owner {
            accountId
          }
        }
        ...ProjectAvatar
      }
    }
  `;
</script>

<script lang="ts">
  // import buildProjectUrl from '$lib/utils/build-project-url';
  // import Github from '$lib/components/icons/Github.svelte';

  // import ProjectAvatar, { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
  // import ProjectName, {
  // PROJECT_NAME_FRAGMENT,
  // } from '../project-badge/components/project-name.svelte';
  import { gql } from 'graphql-request';
  // import type { ProjectCardFragment } from './__generated__/gql.generated';
  import isClaimed from '$lib/utils/project/is-claimed';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  // import type { ProjectCardFragment } from '$lib/components/project-card/__generated__/gql.generated';
  import ProjectAvatar, {
    PROJECT_AVATAR_FRAGMENT,
  } from '$lib/components/project-avatar/project-avatar.svelte';
  import { PROJECT_NAME_FRAGMENT } from '$lib/components/project-badge/components/project-name.svelte';
  import EcosystemGraphSigma from './ecosystem-graph.svelte';
  import Box from '$lib/components/icons/Box.svelte';
  import User from '$lib/components/icons/User.svelte';
  import Coin from '$lib/components/icons/Coin.svelte';
  import { Forge } from '$lib/graphql/__generated__/base-types';
  import Button from '$lib/components/button/button.svelte';
  import type { ProjectProfileFragment } from '../[ecosystemId]/components/__generated__/gql.generated';
  import ArrowExpand from '$lib/components/icons/ArrowExpand.svelte';

  export let project: ProjectProfileFragment;
  export let isHidden: boolean = false;
  export let isInteractive: boolean = false;

  let projectChainData = filterCurrentChainData(project.chainData);

  function buildEcosystemUrl(
    forge: Forge,
    ownerName: string,
    repoName: string,
    exact = true,
  ): string {
    switch (forge) {
      case Forge.GitHub:
        return `/app/ecosystems/github-${encodeURIComponent(ownerName)}-${encodeURIComponent(repoName)}${exact ? '?exact' : ''}`;
      default:
        throw new Error(`Unsupported forge: ${forge}`);
    }
  }
</script>

<a
  class="ecosystem-card-wrapper"
  class:ecosystem-card-wrapper--interactive={isInteractive}
  href={buildEcosystemUrl(project.source.forge, project.source.ownerName, project.source.repoName)}
>
  <div class="ecosystem-card" class:hidden-project={isHidden}>
    <div class="background" class:background--unclaimed={!isClaimed(projectChainData)} />
    {#if $$slots.banner}
      <div class="banner">
        <slot name="banner" />
      </div>
    {/if}
    <div class="header">
      <div class="graph">
        <EcosystemGraphSigma />
      </div>
    </div>
    <div class="details">
      <!-- <div class="source">
        <div class="icon">
          <Github style="height: 20px; fill: var(--color-foreground-level-6)" />
        </div>
        <span class="owner-name">{project.source.ownerName}</span>
      </div> -->
      <h1 class="name">
        <span class="pixelated">
          {project.source.repoName}
          <!-- <ProjectName showSource={false} {project} /> -->
        </span>
      </h1>
      <p class="description">The essential Ethereum ecosystem.</p>
      <div class="avatar">
        <ProjectAvatar project={projectChainData} size="small" outline />
        <span>with <span>Drips AI</span></span>
      </div>
      <div class="cubbies">
        <div><Box style="fill: var(--color-foreground)" />2,618</div>
        <div><User style="fill: var(--color-foreground)" />17,491</div>
        <div><Coin style="fill: var(--color-foreground)" />$186,833.91</div>
      </div>
      <div class="surface top-left">Something</div>
      <div class="surface top-right">
        <Button><ArrowExpand style="fill: var(--color-forground)" />Explore in full screen</Button>
      </div>
      <div class="surface bottom-left">Something</div>
      <div class="surface bottom-right">Something</div>
    </div>
  </div>
</a>

<style>
  .ecosystem-card-wrapper {
    padding: 2px 0;
    margin: -2px 0;
  }

  .ecosystem-card {
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
    aspect-ratio: 1.807;
  }

  .ecosystem-card-wrapper:hover:not(:active) .ecosystem-card,
  .ecosystem-card-wrapper:focus-visible .ecosystem-card {
    box-shadow: var(--elevation-medium);
    transform: translateY(-2px);
  }

  .ecosystem-card-wrapper:focus-visible {
    outline: none;
    background-color: var(--color-foreground-level-1);
  }

  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    border-radius: 1rem 0 0 0;
    background: linear-gradient(
      180deg,
      var(--color-primary-level-2) 0%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .background.background--unclaimed {
    background: linear-gradient(
      180deg,
      var(--color-foreground-level-1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    justify-content: center;
    text-align: center;
  }

  .header {
    flex-grow: 1;
  }

  .graph {
    height: 100%;
  }

  .hidden-project {
    color: var(--color-foreground);
    opacity: 0;
    animation: fadeIn 1s ease forwards;
  }

  .avatar {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  .cubbies {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    border-top: 1px solid var(--color-foreground-level-2);
    position: relative;
    top: 0.75rem;
    left: -0.75rem;
    width: calc(100% + 1.5rem);
  }

  .cubbies > * {
    flex-grow: 1;
    border-right: 1px solid var(--color-foreground-level-2);
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cubbies > *:last-child {
    border-right: none;
  }

  .ecosystem-card-wrapper.ecosystem-card-wrapper--interactive .cubbies {
    display: none;
  }

  .banner {
    position: absolute;
    width: calc(100% - 4rem);
    z-index: 1;
    left: 2rem;
    top: 2rem;
  }

  .surface {
    position: absolute;
    top: 1rem;
    left: 1rem;
  }

  .surface.top-right {
    left: auto;
    right: 1rem;
  }

  .surface.bottom-right {
    left: auto;
    top: auto;
    right: 1rem;
    bottom: 1rem;
  }

  .surface.bottom-left {
    left: 1rem;
    top: auto;
    bottom: 1rem;
  }

  @keyframes fadeIn {
    to {
      opacity: 0.3;
    }
  }
</style>
