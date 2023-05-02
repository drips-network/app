<script lang="ts">
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import type { GitProject } from '$lib/utils/metadata/types';
  import ProjectName from './project-name.svelte';

  export let project: GitProject;

  const SOURCE_TYPE_STRINGS = {
    github: 'on GitHub',
    gitlab: 'on GitLab',
    radicle: 'on Radicle',
    generic: '',
  };
</script>

<div class="project-tooltip">
  <div
    class="background"
    style:background-color={project.owner
      ? 'var(--color-primary-level-2)'
      : 'var(--color-foreground-level-1)'}
  />
  <div class="header">
    <ProjectAvatar {project} size="large" outline />
    <a class="name typo-header-4" href="/app/projects/{project.repoDriverAccount.userId}"
      ><ProjectName {project} /></a
    >
    {#if project.owner}
      <div class="owner typo-text-small">
        <span>Owned by </span>
        <IdentityBadge address={project.owner.address} disableTooltip size="small" />
      </div>
    {/if}
    {#if project.source.forge === 'generic'}
      <div class="owner typo-text-small">
        <span>Hosted on</span>
        <span class="typo-text-small-bold">{new URL(project.source.url).host}</span>
      </div>
    {/if}
  </div>
  {#if project.source.url}
    <a class="typo-text-small" href={project.source.url} target="_blank" rel="noreferrer"
      >View repo {SOURCE_TYPE_STRINGS[project.source.forge]}</a
    >
  {/if}
</div>

<style>
  .project-tooltip {
    width: 100%;
    max-width: fit-content;
    min-width: 10rem;
  }

  .header {
    padding-top: 0.5rem;
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  .name {
    text-decoration: none;
  }

  .background {
    position: absolute;
    top: 0.5rem;
    left: 0;
    right: 0;
    height: 3rem;
    border-radius: 1rem 0 0 0;
  }

  .owner {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: -0.25rem;
    color: var(--color-foreground-level-6);
  }

  .owner * {
    white-space: nowrap;
  }

  a {
    text-decoration: underline;
    color: var(--color-foreground-level-6);
    margin-bottom: 0;
  }
</style>
