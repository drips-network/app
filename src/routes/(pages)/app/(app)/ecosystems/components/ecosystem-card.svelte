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
  import buildProjectUrl from '$lib/utils/build-project-url';
  // import Github from '$lib/components/icons/Github.svelte';

  // import ProjectAvatar, { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
  // import ProjectName, {
  // PROJECT_NAME_FRAGMENT,
  // } from '../project-badge/components/project-name.svelte';
  import { gql } from 'graphql-request';
  // import type { ProjectCardFragment } from './__generated__/gql.generated';
  import isClaimed from '$lib/utils/project/is-claimed';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import type { ProjectCardFragment } from '$lib/components/project-card/__generated__/gql.generated';
  import ProjectAvatar, {
    PROJECT_AVATAR_FRAGMENT,
  } from '$lib/components/project-avatar/project-avatar.svelte';
  import { PROJECT_NAME_FRAGMENT } from '$lib/components/project-badge/components/project-name.svelte';
  import EcosystemNetwork from './ecosystem-network.svelte';

  export let project: ProjectCardFragment;
  export let isHidden = false;
  let projectChainData = filterCurrentChainData(project.chainData);
</script>

<a
  class="ecosystem-card-wrapper"
  href={buildProjectUrl(project.source.forge, project.source.ownerName, project.source.repoName)}
>
  <div class="ecosystem-card" class:hidden-project={isHidden}>
    <div class="background" class:background--unclaimed={!isClaimed(projectChainData)} />
    <div class="header">
      <div class="network">
        <EcosystemNetwork />
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
        <ProjectAvatar project={projectChainData} size="large" outline />
      </div>
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
    height: 403px;
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
    height: 50%;
  }

  .network {
    height: 100%;
  }

  .hidden-project {
    color: var(--color-foreground);
    opacity: 0;
    animation: fadeIn 1s ease forwards;
  }

  @keyframes fadeIn {
    to {
      opacity: 0.3;
    }
  }
</style>
