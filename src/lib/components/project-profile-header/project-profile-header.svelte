<script lang="ts" context="module">
  export const PROJECT_PROFILE_HEADER_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    ${PROJECT_AVATAR_FRAGMENT}
    fragment ProjectProfileHeader on Project {
      ...ProjectBadge
      ...ProjectAvatar
      ... on ClaimedProject {
        source {
          url
        }
      }
      ... on UnclaimedProject {
        source {
          url
        }
      }
    }
  `;
</script>

<script lang="ts">
  import ProjectAvatar, {
    PROJECT_AVATAR_FRAGMENT,
  } from '$lib/components/project-avatar/project-avatar.svelte';
  import ProjectBadge, {
    PROJECT_BADGE_FRAGMENT,
  } from '$lib/components/project-badge/project-badge.svelte';
  import { createEventDispatcher } from 'svelte';
  import Button from '../button/button.svelte';
  import Copyable from '../copyable/copyable.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import { gql } from 'graphql-request';
  import type { ProjectProfileHeaderFragment } from './__generated__/gql.generated';
  import ShareButton from '../share-button/share-button.svelte';

  export let project: ProjectProfileHeaderFragment;
  export let editButton: string | undefined = undefined;
  export let shareButton:
    | {
        url: string;
      }
    | undefined = undefined;

  export let pendingAvatar = false;

  const dispatch = createEventDispatcher<{ editButtonClick: never }>();
</script>

<div class="flex flex-col gap-4 items-start sm:flex-row sm:justify-between relative">
  <div class="max-w-full flex-1 min-w-0 flex flex-col gap-2 sm:flex-row sm:gap-8 sm:items-center">
    <div class="avatar">
      <ProjectAvatar {pendingAvatar} {project} size="huge" />
    </div>
    <div class="flex-1 min-w-0 flex flex-col gap-1">
      <h1>{project.source.repoName}</h1>
      <Copyable alwaysVisible={true} value={project.source.url}>
        <ProjectBadge {project} forceUnclaimed tooltip={false} linkTo="external-url" />
      </Copyable>
    </div>
    {#if editButton || shareButton}
      <div class="actions">
        {#if shareButton}
          <ShareButton url={shareButton.url} />
        {/if}
        {#if editButton}
          <Button icon={Pen} on:click={() => dispatch('editButtonClick')}>{editButton}</Button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .actions {
    display: flex;
    gap: 1rem;
  }
</style>
