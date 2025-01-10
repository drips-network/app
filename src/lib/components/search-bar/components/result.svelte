<script lang="ts">
  import type { ProjectResult, Result as ResultType } from '../types';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import DripListAvatar from '$lib/components/drip-list-avatar/drip-list-avatar.svelte';
  import network from '$lib/stores/wallet/network';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';

  export let item: ResultType;

  function splitGitHubUrl(url: string) {
    const [owner, repo] = url.split('/').slice(-2);
    return { owner, repo };
  }

  function makeFakeProjectAvatarType(item: ProjectResult) {
    if (item.avatarCid && item.color) {
      return {
        __typename: 'ClaimedProjectData' as const,
        chain: network.gqlName,
        color: item.color,
        avatar: {
          __typename: 'ImageAvatar' as const,
          cid: item.avatarCid,
        },
      };
    } else if (item.emoji && item.color) {
      return {
        __typename: 'ClaimedProjectData' as const,
        chain: network.gqlName,
        color: item.color,
        avatar: {
          __typename: 'EmojiAvatar' as const,
          emoji: item.emoji,
        },
      };
    } else {
      return {
        __typename: 'UnClaimedProjectData' as const,
      };
    }
  }

  function pickLabel(item: ResultType) {
    switch (item.type) {
      case 'ens': {
        return item.name;
      }
      default: {
        return (item._formatted ?? item).name;
      }
    }
  }
</script>

{#if item.type === 'project'}
  {@const { owner, repo } = splitGitHubUrl(item.url)}
  {@const avatarConfig = makeFakeProjectAvatarType(item)}
  <a class="search-result typo-text" href={`/app/projects/github/${owner}/${repo}`}>
    {#if avatarConfig.__typename === 'ClaimedProjectData'}
      <div style:margin-right="-1.25rem">
        <ProjectAvatar project={{ __typename: 'UnClaimedProjectData' }} />
      </div>
    {/if}
    <ProjectAvatar project={avatarConfig} />
    <div class="label">
      {@html pickLabel(item)}
    </div>
  </a>
{:else if item.type === 'drip_list'}
  <a class="search-result typo-text" href={`/app/drip-lists/${item.id}`}>
    <DripListAvatar />
    <div class="label">
      {@html pickLabel(item)}
    </div>
  </a>
{:else if item.type === 'address'}
  <a class="search-result typo-text" href={`/app/${item.address}`}>
    <IdentityBadge size="medium" disableTooltip={true} address={item.address} />
  </a>
{/if}

<style>
  a {
    display: flex;
    gap: 0.5rem;
    padding: 0.25rem;
    align-items: center;
    border-radius: 1.25rem 0 1.25rem 1.25rem;
  }

  a:hover,
  a:focus-visible {
    background-color: var(--color-foreground-level-1);
  }

  .search-result :global(em) {
    font-style: normal;
    background-color: var(--color-primary-level-2);
    color: var(--color-foreground);
    border-radius: 0.2rem;
  }
</style>
