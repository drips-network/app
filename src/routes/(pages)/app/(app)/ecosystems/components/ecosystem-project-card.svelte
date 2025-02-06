<script lang="ts">
  import DripList from '$lib/components/icons/DripList.svelte';
  import Pie from '$lib/components/icons/Pie.svelte';
  import User from '$lib/components/icons/User.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import twemoji from '$lib/utils/twemoji';
  import type { ProjectProfileFragment } from '../[ecosystemId]/components/__generated__/gql.generated';

  export let project: ProjectProfileFragment;
  export let description: string =
    'Complete Ethereum library and wallet implementation in JavaScript.';

  let projectChainData = filterCurrentChainData(project.chainData);
</script>

<div class="ecosystem-project-card">
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
    <div>
      <Pie style="fill: var(--color-background)" /><strong class="ml-1 typo-text-bold">2.47%</strong
      > of ecosystem funds
    </div>
    <div>
      <DripList style="fill: var(--color-foreground)" /><strong class="ml-1 typo-text-bold"
        >50%</strong
      > to 8 dependencies
    </div>
    <div>
      <User style="fill: var(--color-foreground)" /><strong class="ml-1 typo-text-bold">50%</strong>
      to 2 maintainers
    </div>
  </div>
</div>

<style>
  .ecosystem-project-card {
    box-shadow: var(--elevation-low);
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
</style>
