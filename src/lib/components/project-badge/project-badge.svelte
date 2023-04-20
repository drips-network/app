<script lang="ts" context="module">
  //TODO: Replace with imported types once centrally defined

  export interface GitHubSource {
    type: 'github';
    repoName: string;
    ownerName: string;
    url: string;
  }

  export interface GitLabSource {
    type: 'gitlab';
    repoName: string;
    ownerName: string;
    host: string;
    url: string;
  }

  export interface RadicleSource {
    type: 'radicle';
    rid: string;
    repoName: string;
    seed: string;
    url: string;
  }

  export interface GenericGitSource {
    type: 'generic';
    repoName: string;
    url: string;
  }

  export type Source = GitHubSource | GitLabSource | RadicleSource | GenericGitSource;

  type Address = string;
  type UserId = string;

  export interface AddressDriverAccount {
    driver: 'address';
    userId: UserId;
    address: Address;
  }

  export interface GitDriverAccount {
    userId: UserId;
    driver: 'git';
  }

  export interface UnclaimedGitProject {
    gitDriverAccount: GitDriverAccount;
    owner: undefined;
    source: Source;
  }

  export interface ClaimedGitProject {
    gitDriverAccount: GitDriverAccount;
    owner: AddressDriverAccount;
    source: Source;
    emoji: string;
    color: string;
    description?: string;
  }

  export type GitProject = UnclaimedGitProject | ClaimedGitProject;
</script>

<script lang="ts">
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import ProjectTooltip from './components/project-tooltip.svelte';
  import ProjectName from './components/project-name.svelte';

  export let project: GitProject;
  export let tooltip = true;

  export let hideAvatar = false;
</script>

<Tooltip disabled={!tooltip}>
  <a class="project-badge" href="/app/projects/{project.gitDriverAccount.userId}">
    {#if !hideAvatar}<ProjectAvatar {project} />{/if}
    <div class="name">
      <ProjectName {project} />
    </div>
  </a>
  <svelte:fragment slot="tooltip-content">
    <ProjectTooltip {project} />
  </svelte:fragment>
</Tooltip>

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

  .project-badge {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .name {
    display: flex;
    min-width: 0;
  }
</style>
