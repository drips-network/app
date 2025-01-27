<script lang="ts" context="module">
  export const PROJECT_PROFILE_HEADER_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    ${PROJECT_AVATAR_FRAGMENT}
    fragment ProjectProfileHeader on Project {
      ...ProjectBadge
      source {
        url
      }
      chainData {
        ...ProjectAvatar
        ... on ClaimedProjectData {
          chain
          owner {
            address
          }
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
  import { createEventDispatcher, type ComponentProps } from 'svelte';
  // import Button from '../button/button.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import { gql } from 'graphql-request';
  // import type { ProjectProfileHeaderFragment } from './__generated__/gql.generated';
  // import ShareButton from '../share-button/share-button.svelte';
  import twemoji from '$lib/utils/twemoji';
  // import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import isClaimed from '$lib/utils/project/is-claimed';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import type { ProjectProfileHeaderFragment } from '$lib/components/project-profile-header/__generated__/gql.generated';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import Button from '$lib/components/button/button.svelte';
  // import type { ProjectProfileHeaderFragment } from '$lib/components/project-profile-header/__generated__/gql.generated';

  export let project: ProjectProfileHeaderFragment;
  export let description: string | undefined = undefined;
  export let editButton: string | undefined = undefined;
  export let shareButton: ComponentProps<ShareButton> | undefined = undefined;

  export let pendingAvatar = false;

  $: projectChainData = filterCurrentChainData(project.chainData);

  const dispatch = createEventDispatcher<{ editButtonClick: void }>();
</script>

<div class="flex flex-col gap-4 items-start sm:flex-row sm:justify-between relative">
  <div class="max-w-full flex-1 min-w-0 flex flex-col gap-2 sm:flex-row sm:gap-8 sm:items-center">
    <div class="avatar">
      <ProjectAvatar {pendingAvatar} project={projectChainData} size="huge" />
    </div>
    <div class="flex-1 min-w-0 flex flex-col gap-1">
      <h1>{project.source.repoName}</h1>
      <div style:display="flex" style:gap="0.75rem" style:flex-wrap="wrap">
        {#if isClaimed(projectChainData)}
          <IdentityBadge address={projectChainData.owner.address} />
        {/if}
        <ProjectBadge size="tiny" {project} forceUnclaimed tooltip={false} linkTo="external-url" />
      </div>
      {#if description}
        <span
          class="typo-text-small line-clamp-2 twemoji-text"
          style:margin-top="0.25rem"
          style:color="var(--color-foreground-level-4)"
          >{@html twemoji(description)}
        </span>
      {/if}
    </div>
    {#if editButton || shareButton}
      <div class="actions">
        {#if shareButton}
          <ShareButton buttonVariant="normal" {...shareButton} />
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
