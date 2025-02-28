<script lang="ts" context="module">
  // export const PROJECT_CARD_FRAGMENT = gql`
  //   ${PROJECT_AVATAR_FRAGMENT}
  //   ${PROJECT_NAME_FRAGMENT}
  //   fragment ProjectCard on Project {
  //     ...ProjectName
  //     isVisible
  //     source {
  //       forge
  //       ownerName
  //       repoName
  //     }
  //     chainData {
  //       ... on ClaimedProjectData {
  //         chain
  //         owner {
  //           accountId
  //         }
  //       }
  //       ... on UnClaimedProjectData {
  //         chain
  //         owner {
  //           accountId
  //         }
  //       }
  //       ...ProjectAvatar
  //     }
  //   }
  // `;
</script>

<script lang="ts">
  import EcosystemGraph from './ecosystem-graph.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowExpand from '$lib/components/icons/ArrowExpand.svelte';
  import Minus from '$lib/components/icons/Minus.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  // import SearchInput from '$lib/components/search-bar/components/search-input.svelte';
  import EcosystemProjectCard from './ecosystem-project-card.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import { type NodeSelectionChangedPayload } from './ecosystem-graph';
  import { fade } from 'svelte/transition';

  export let ecosystem: Ecosystem;
  export let isHidden: boolean = false;
  export let isInteractive: boolean = false;

  let expanded: boolean = false;

  // let the graph decide
  let zoom: number = 1;
  let selectedProjectData:
    | {
        repoOwner: string;
        repoName: string;
        forge: string;
      }
    | undefined = undefined;
  let projectMetadata:
    | {
        absoluteWeight: number;
      }
    | undefined = undefined;

  const ZOOM_INCREMENT = 0.2;
  function zoomIn(event: MouseEvent) {
    event.stopPropagation();

    zoom = zoom + ZOOM_INCREMENT;
  }

  function zoomOut(event: MouseEvent) {
    event.stopPropagation();

    zoom = zoom - ZOOM_INCREMENT;
  }

  function getEcosystemNodeById(ecosystem: Ecosystem, nodeId: string) {
    const { graph } = ecosystem;
    if (!graph) {
      return null;
    }

    return graph.nodes.find((node) => node.projectAccountId == nodeId);
  }

  async function showProjectData(nodeId: string) {
    const fullNode = getEcosystemNodeById(ecosystem, nodeId);
    // TODO: bad, fail
    if (!fullNode) {
      return;
    }

    projectMetadata = { absoluteWeight: fullNode.absoluteWeight };
    selectedProjectData = {
      repoOwner: fullNode.repoOwner,
      repoName: fullNode.repoName,
      forge: 'github',
    };
    // eslint-disable-next-line no-console
    console.log('project', selectedProjectData);
  }

  function handleNodeSelectionChanged(event: CustomEvent<NodeSelectionChangedPayload>) {
    const { nodeId } = event.detail;
    if (!nodeId) {
      selectedProjectData = undefined;
      projectMetadata = undefined;
      return;
    }

    showProjectData(nodeId);
    return;
  }

  async function handleClickExpand() {
    expanded = !expanded;
  }
</script>

<div
  class="ecosystem-card-wrapper"
  class:ecosystem-card-wrapper--interactive={isInteractive}
  class:expanded
>
  <div class="ecosystem-card" class:hidden-project={isHidden}>
    <div class="background" />
    <div class="graph">
      <EcosystemGraph {ecosystem} bind:zoom on:nodeSelectionChanged={handleNodeSelectionChanged} />
    </div>
    {#if $$slots.banner}
      <div class="banner">
        <slot name="banner" />
      </div>
    {/if}
    <!-- <div class="header">

    </div> -->
    <div class="details">
      <!-- <div class="source">
        <div class="icon">
          <Github style="height: 20px; fill: var(--color-foreground-level-6)" />
        </div>
        <span class="owner-name">{project.source.ownerName}</span>
      </div> -->
      <!-- <h1 class="name">
        <span class="pixelated">
          {project.source.repoName}
          <ProjectName showSource={false} {project} />
        </span>
      </h1> -->
      <!-- <p class="description">The essential Ethereum ecosystem.</p> -->
      <!-- <div class="avatar">
        <ProjectAvatar project={projectChainData} size="small" outline />
        <span>with <span>Drips AI</span></span>
      </div> -->
      <!-- <div class="cubbies">
        <div><Box style="fill: var(--color-foreground)" />2,618</div>
        <div><User style="fill: var(--color-foreground)" />17,491</div>
        <div><Coin style="fill: var(--color-foreground)" />$186,833.91</div>
      </div> -->
      <div class="surface top-left">
        <!-- <SearchInput small placeholder="Search" /> -->
      </div>
      <div class="surface top-right">
        <Button on:click={handleClickExpand}>
          <ArrowExpand style="fill: var(--color-foreground)" />
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      {#if selectedProjectData}
        <div class="surface bottom-left" transition:fade={{ duration: 300 }}>
          <EcosystemProjectCard loadProjectData={selectedProjectData} {projectMetadata} />
        </div>
      {/if}
      <div class="surface bottom-right">
        <Button circular on:click={(event) => zoomIn(event)}
          ><Plus style="fill: var(--color-foreground)" /></Button
        >
        <Button circular on:click={(event) => zoomOut(event)}
          ><Minus style="fill: var(--color-foreground)" /></Button
        >
      </div>
    </div>
  </div>
</div>

<style>
  .ecosystem-card-wrapper {
    padding: 2px 0;
    margin: -2px 0;
    transform: translateZ(0);
    padding-bottom: 55.3%;
  }

  .ecosystem-card-wrapper.expanded {
    transform: none;
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
    /* aspect-ratio: 1.807; */

    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 10;
    background: var(--color-background);
  }

  .ecosystem-card-wrapper.expanded .ecosystem-card {
    border-radius: 0;
  }

  /* .ecosystem-card.expanded {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    aspect-ratio: auto;
    background: white;
    z-index: 10;
    border-radius: 0;
  } */

  /* .ecosystem-card-wrapper:hover:not(:active) .ecosystem-card,
  .ecosystem-card-wrapper:focus-visible .ecosystem-card {
    box-shadow: var(--elevation-medium);
    transform: translateY(-2px);
  } */

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

  .ecosystem-card-wrapper.expanded .background {
    border-radius: 0;
  }

  /* .background.background--unclaimed {
    background: linear-gradient(
      180deg,
      var(--color-foreground-level-1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
  } */

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    justify-content: center;
    text-align: center;
  }

  /* .header {
    flex-grow: 1;
    position: relative;
  } */

  .graph {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .ecosystem-card-wrapper.expanded .graph {
    border-radius: 0;
  }

  .hidden-project {
    color: var(--color-foreground);
    opacity: 0;
    animation: fadeIn 1s ease forwards;
  }

  /* .avatar {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  } */

  /* .cubbies {
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
  } */

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
    z-index: 20;
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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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

  @media (max-width: 768px) {
    .ecosystem-card-wrapper {
      padding-bottom: 131.57%;
    }

    .surface,
    .surface.bottom-right {
      display: none;
    }

    .surface.bottom-left {
      display: block;
      top: 1.5rem;
      bottom: auto;
      left: 1.5rem;
    }

    .surface.top-right {
      display: block;
      left: 1.5rem;
      right: auto;
      bottom: 1.5rem;
      top: auto;
    }

    .graph {
      pointer-events: none;
    }

    .ecosystem-card-wrapper.expanded .graph {
      pointer-events: all;
    }

    .ecosystem-card-wrapper.expanded .surface.bottom-right {
      display: flex;
    }
  }
</style>
