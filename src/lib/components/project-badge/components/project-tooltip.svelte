<script lang="ts" context="module">
  import { gql } from 'graphql-request';
  import { PROJECT_AVATAR_FRAGMENT } from '$lib/components/project-avatar/project-avatar.svelte';
  import { PROJECT_NAME_FRAGMENT } from './project-name.svelte';

  export const PROJECT_TOOLTIP_FRAGMENT = gql`
    ${PROJECT_AVATAR_FRAGMENT}
    ${PROJECT_NAME_FRAGMENT}
    fragment ProjectTooltip on Project {
      ...ProjectAvatar
      ...ProjectName
      ... on ClaimedProject {
        owner {
          address
        }
        source {
          url
          forge
          ownerName
          repoName
        }
      }
      ... on UnclaimedProject {
        source {
          url
          ownerName
          repoName
          forge
        }
      }
    }
  `;
</script>

<script lang="ts">
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import type { Forge } from '$lib/graphql/__generated__/base-types';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import isClaimed from '$lib/utils/project/is-claimed';
  import ProjectName from './project-name.svelte';
  import type { ProjectTooltipFragment } from './__generated__/gql.generated';


  export let project: ProjectTooltipFragment;

  const SOURCE_TYPE_STRINGS: { [K in Forge]: string } = {
    GitHub: 'on GitHub',
    GitLab: 'on GitLab',
  };
</script>

<div class="project-tooltip">
  <div
    class="background"
    style:background-color={isClaimed(project)
      ? 'var(--color-primary-level-2)'
      : 'var(--color-foreground-level-1)'}
  />
  <div class="header">
    <ProjectAvatar {project} size="large" outline />
    <a class="name typo-header-4" href={buildProjectUrl(project.source.forge, project.source.ownerName, project.source.repoName)}
      ><ProjectName {project} /></a
    >
    {#if isClaimed(project)}
      <div class="owner typo-text-small">
        <span>Owned by </span>
        <IdentityBadge linkToNewTab address={project.owner.address} disableTooltip size="small" />
      </div>
    {/if}
  </div>
  {#if project.source.url}
    <a
      class="typo-text-small"
      href={buildExternalUrl(project.source.url)}
      target="_blank"
      rel="noreferrer">View repo {SOURCE_TYPE_STRINGS[project.source.forge]}</a
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
