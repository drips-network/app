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
  import { PROJECT_BADGE_FRAGMENT } from '$lib/components/project-badge/project-badge.svelte';
  import { gql } from 'graphql-request';
  import twemoji from '$lib/utils/twemoji';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import type { ProjectProfileHeaderFragment } from '$lib/components/project-profile-header/__generated__/gql.generated';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';

  export let ecosystem: Ecosystem;
  export let project: ProjectProfileHeaderFragment;

  export let pendingAvatar = false;

  const TODO_REMOVE_FALLBACK_ADDRESS = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

  $: projectChainData = filterCurrentChainData(project.chainData);
  // TODO: get owner of NFT once the ecosystem is deployed.
  $: ownerAddress = ecosystem.ownerAddress ?? TODO_REMOVE_FALLBACK_ADDRESS;
</script>

<div
  class="ecosystem-profile-header flex flex-col gap-4 items-center sm:flex-row sm:justify-between relative"
>
  <div
    class="max-w-full flex-1 min-w-0 flex flex-col gap-2 items-center sm:flex-row sm:gap-8 sm:items-center"
  >
    <div class="avatar">
      <ProjectAvatar {pendingAvatar} project={projectChainData} size="huge" />
    </div>
    <div class="flex-1 min-w-0 flex flex-col gap-1">
      <h1>{ecosystem.name}</h1>
      <div class="flex justify-center sm:justify-start">
        <div class="identity-wrapper">
          <IdentityBadge address={ownerAddress} />
        </div>
      </div>
      {#if ecosystem.description}
        <span
          class="typo-text-small line-clamp-2 twemoji-text"
          style:margin-top="0.25rem"
          style:color="var(--color-foreground-level-4)"
          >{@html twemoji(ecosystem.description)}
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  .identity-wrapper {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.25rem 0.75rem 0.25rem 0.25rem;
    display: inline-flex;
  }
</style>
