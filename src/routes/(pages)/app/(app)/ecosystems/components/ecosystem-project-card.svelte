<script lang="ts">
  // import Button from '$lib/components/button/button.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  // import Pen from '$lib/components/icons/Pen.svelte';
  import Pie from '$lib/components/icons/Pie.svelte';
  // import Trash from '$lib/components/icons/Trash.svelte';
  import User from '$lib/components/icons/User.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import twemoji from '$lib/utils/twemoji';
  import { onMount } from 'svelte';
  import type { ProjectProfileFragment } from '../[ecosystemId]/components/__generated__/gql.generated';
  import { fetchProject } from './ecosystem-graph';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import isClaimed from '$lib/utils/project/is-claimed';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  // import { fade } from 'svelte/transition';

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
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });

  $: projectChainData = project ? filterCurrentChainData(project.chainData) : undefined;
  $: loadProjectData.forge, loadProjectData.repoName, loadProjectData.repoOwner, loadProject();
  $: dependenciesCount =
    projectChainData && isClaimed(projectChainData)
      ? projectChainData.splits.dependencies.length
      : 0;
  $: dependenciesPercentage =
    projectChainData && isClaimed(projectChainData)
      ? percentFormatter.format(
          projectChainData.splits.dependencies.reduce((sum, dep) => sum + dep.weight, 0),
        )
      : '0%';
  $: dependenciesStatement =
    dependenciesCount > 1
      ? `to ${dependenciesCount} dependencies`
      : `to ${dependenciesCount} dependency`;
  $: maintainersCount =
    projectChainData && isClaimed(projectChainData)
      ? projectChainData.splits.maintainers.length
      : 0;
  $: maintainersPercentage =
    projectChainData && isClaimed(projectChainData)
      ? percentFormatter.format(
          projectChainData.splits.maintainers.reduce((sum, dep) => sum + dep.weight, 0),
        )
      : '0%';
  $: maintainersStatement =
    maintainersCount > 1
      ? `to ${maintainersCount} maintainers`
      : `to ${maintainersCount} maintainer`;

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

      // await tick()
      // if (projectChainData) {

      //         {
      //     __typename: "AddressReceiver";
      //     driver: Driver;
      //     weight: number;
      //     account: {
      //         __typename: "AddressDriverAccount";
      //         address: string;
      //         driver: Driver;
      //         accountId: string;
      //     };
      // }
      // projectData.project.chainData
      // projectChainData.splits = {}
      // projectChainData.splits.maintainers = [{
      //   __typename: "AddressReceiver",
      //   driver: '',
      //   weight: 0.1,
      //   account: {
      //       __typename: "AddressDriverAccount",
      //       address: 'address',
      //       driver: 'driver',
      //       accountId: 'accountId',
      //   }
      // }]
      // projectChainData.splits.dependencies = [{
      //   __typename: "AddressReceiver",
      //   driver: '',
      //   weight: 0.1,
      //   account: {
      //       __typename: "AddressDriverAccount",
      //       address: 'address',
      //       driver: 'driver',
      //       accountId: 'accountId',
      //   }
      // }]
      // }
    } finally {
      loading = false;
    }
  }

  onMount(loadProject);
</script>

<PrimaryColorThemer
  colorHex={projectChainData && isClaimed(projectChainData) ? projectChainData.color : undefined}
>
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
          <ProjectBadge size="tiny" {project} projectNameSize="small" />
        </div>
        <div>
          <span class="line-clamp-2 twemoji-text">{@html twemoji(description)} </span>
        </div>
      </div>
      <div class="stats">
        {#if Number.isFinite(projectMetadata?.absoluteWeight)}
          <div>
            <Pie style="fill: var(--color-background)" /><strong class="ml-1 typo-text-bold"
              >{percentFormatter.format(Number(projectMetadata?.absoluteWeight))}&nbsp;</strong
            >of ecosystem funds
          </div>
        {/if}
        {#if isClaimed(projectChainData)}
          <div>
            <DripList style="fill: var(--color-foreground)" /><strong class="ml-1 typo-text-bold"
              >{dependenciesPercentage}&nbsp;</strong
            >
            {dependenciesStatement}
          </div>
          <div>
            <User style="fill: var(--color-foreground)" /><strong class="ml-1 typo-text-bold"
              >{maintainersPercentage}&nbsp;</strong
            >
            {maintainersStatement}
          </div>
        {/if}
      </div>
      <div class="actions">
        <!-- <Button circular icon={Trash}></Button> -->
        <!-- <Button circular icon={Pen}></Button> -->
      </div>
    {/if}
  </div>
</PrimaryColorThemer>

<style>
  .ecosystem-project-card {
    box-shadow: var(--elevation-medium);
    border-radius: 1rem 0 1rem 1rem;
    padding: 1.5rem;
    position: relative;
    gap: 0 1rem;
    display: flex;
    max-width: 44rem;
    height: 167px;
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
