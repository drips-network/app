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
  import ProjectAvatar, { PROJECT_AVATAR_FRAGMENT } from '$lib/components/project-avatar/project-avatar.svelte';
  import ProjectBadge, { PROJECT_BADGE_FRAGMENT } from '$lib/components/project-badge/project-badge.svelte';
  import { createEventDispatcher } from 'svelte';
  import Button from '../button/button.svelte';
  import Copyable from '../copyable/copyable.svelte';
  import Pen from 'radicle-design-system/icons/Pen.svelte';
  import { gql } from 'graphql-request';
  import type { ProjectProfileHeaderFragment } from './__generated__/gql.generated';

  export let project: ProjectProfileHeaderFragment;
  export let editButton: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ editButtonClick: never }>();
</script>

<div class="flex flex-col gap-4 items-start sm:flex-row sm:justify-between relative">
  <div class="max-w-full flex-1 min-w-0 flex flex-col gap-2 sm:flex-row sm:gap-8 sm:items-center">
    <div class="avatar">
      <ProjectAvatar {project} size="huge" />
    </div>
    <div class="flex-1 min-w-0 flex flex-col gap-1">
      <h1>{project.source.repoName}</h1>
      <Copyable alwaysVisible={true} value={project.source.url}>
        <ProjectBadge {project} forceUnclaimed tooltip={false} linkTo="external-url" />
      </Copyable>
    </div>
  </div>
  {#if editButton}
    <div class="absolute top-0 right-0 sm:static">
      <Button icon={Pen} on:click={() => dispatch('editButtonClick')}>{editButton}</Button>
    </div>
  {/if}
</div>
