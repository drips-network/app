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

  type Source = GitHubSource | GitLabSource | RadicleSource | GenericGitSource;

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

  export interface ClaimedGitProject {
    gitDriverAccount: GitDriverAccount;
    owner: AddressDriverAccount;
    source: Source;
    emoji: string;
    color: string;
    description?: string;
  }
</script>

<script lang="ts">
  import buildProjectUrl from '$lib/utils/build-project-url';

  import ProjectAvatar from '../project-avatar/project-avatar.svelte';
  import ProjectName from '../project-badge/components/project-name.svelte';

  export let project: ClaimedGitProject;
</script>

<a class="wrapper" href={buildProjectUrl(project.source)}>
  <div class="project-card">
    <div
      class="background"
      style:background-color={project.owner
        ? 'var(--color-primary-level-2)'
        : 'var(--color-foreground-level-1)'}
    />
    <div class="header">
      <div class="avatar"><ProjectAvatar {project} size="large" outline /></div>
    </div>
    <div class="name-and-description">
      <h4 class="name"><ProjectName {project} /></h4>
      {#if project.description}<p class="description">{project.description}</p>{/if}
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
    transition: box-shadow 0.2s, backgorund-color 0.2s, transform 0.2s;
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
  }

  .name-and-description {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    justify-content: center;
  }

  .description {
    color: var(--color-foreground-level-6);
    line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
