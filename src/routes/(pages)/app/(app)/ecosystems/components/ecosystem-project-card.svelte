<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import Pie from '$lib/components/icons/Pie.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import User from '$lib/components/icons/User.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import twemoji from '$lib/utils/twemoji';
  import { onMount } from 'svelte';
  import type { ProjectProfileFragment } from '../[ecosystemId]/components/__generated__/gql.generated';
  import { fetchProject } from './ecosystem-graph';
  import Spinner from '$lib/components/spinner/spinner.svelte';

  export let loadProjectData: {
    forge: string;
    repoOwner: string;
    repoName: string;
  };
  export let projectMetadata:
    | {
        absoluteWeight: number;
      }
    | undefined = undefined;

  export let project: ProjectProfileFragment | undefined = undefined;
  export let description: string | undefined = undefined;

  let loading: boolean = false;

  const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  $: projectChainData = project ? filterCurrentChainData(project.chainData) : undefined;
  $: loadProjectData.forge, loadProjectData.repoName, loadProjectData.repoOwner, loadProject();

  async function loadProject() {
    // TODO: if project return

    try {
      loading = true;
      const projectData = await fetchProject(
        loadProjectData.repoOwner,
        loadProjectData.repoName,
        loadProjectData.forge,
      );
      project = projectData.project;
      description = projectData.description;
    } finally {
      loading = false;
    }
  }

  onMount(loadProject);
</script>

<div class="ecosystem-project-card" class:loading>
  {#if loading}
    <Spinner visibilityDelay={0} />
  {:else if projectChainData && description && project}
    <div class="avatar">
      <ProjectAvatar project={projectChainData} size="xlarge" outline />
    </div>
    <div class="details">
      <h2>
        <span class="pixelated">
          {project.source.repoName}
        </span>
      </h2>
      <div>
        <ProjectBadge size="tiny" {project} />
      </div>
      <div>
        <span class="line-clamp-2 twemoji-text">{@html twemoji(description)} </span>
      </div>
    </div>
    <div class="stats">
      {#if Number.isFinite(projectMetadata?.absoluteWeight)}
        <div>
          <Pie style="fill: var(--color-background)" /><strong class="ml-1 typo-text-bold"
            >{percentFormatter.format(Number(projectMetadata?.absoluteWeight))}</strong
          > of ecosystem funds
        </div>
      {/if}
      <div>
        <DripList style="fill: var(--color-foreground)" /><strong class="ml-1 typo-text-bold"
          >50%</strong
        > to 8 dependencies
      </div>
      <div>
        <User style="fill: var(--color-foreground)" /><strong class="ml-1 typo-text-bold"
          >50%</strong
        >
        to 2 maintainers
      </div>
    </div>
    <div class="actions">
      <Button circular icon={Trash}></Button>
      <Button circular icon={Pen}></Button>
    </div>
  {/if}
</div>

<style>
  .ecosystem-project-card {
    box-shadow: var(--elevation-medium);
    border-radius: 1rem 0 1rem 1rem;
    padding: 1.5rem;
    position: relative;
    gap: 0 1rem;
    display: flex;
    max-width: 44rem;
    transition:
      box-shadow 0.2s,
      backgorund-color 0.2s,
      transform 0.2s;
    background-color: var(--color-background);
    text-align: initial;
  }

  .ecosystem-project-card.loading {
    width: 44rem;
    height: 152px;
    align-items: center;
    justify-content: center;
    /* aspect-ratio: 704 / 152; */
  }

  .avatar {
    align-self: center;
  }

  .details,
  .stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stats {
    gap: 1rem;
  }

  .stats > * {
    white-space: nowrap;
    display: flex;
  }

  .actions {
    position: absolute;
    right: -1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    height: 100%;
    top: 0;
  }
</style>
