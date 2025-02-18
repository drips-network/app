<script lang="ts">
  import type { DripListResult, ProjectResult, Result as ResultType } from '../types';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import network from '$lib/stores/wallet/network';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import sanitize from 'sanitize-html';
  import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import unreachable from '$lib/utils/unreachable';

  export let item: ResultType;

  export let element: HTMLElement;

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

  function makeFakeDripListBadgeType(item: DripListResult) {
    return {
      __typename: 'DripList' as const,
      chain: network.gqlName,
      isVisible: true,
      account: {
        __typename: 'NftDriverAccount' as const,
        accountId: item.id ?? unreachable(),
      },
      name: item.name ?? '',
      owner: {
        __typename: 'AddressDriverAccount' as const,
        address: item.ownerAddress ?? unreachable(),
      },
    };
  }

  function pickLabel(item: DripListResult | ProjectResult) {
    return sanitize((item._formatted ?? item).name ?? '', {
      allowedTags: ['em'],
      allowedAttributes: {},
    });
  }
</script>

{#if item.type === 'project'}
  {@const { owner, repo } = splitGitHubUrl(item.url)}
  {@const avatarConfig = makeFakeProjectAvatarType(item)}
  <a
    bind:this={element}
    class="search-result typo-text"
    href={`/app/projects/github/${owner}/${repo}?exact`}
    on:click
  >
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
  <a
    bind:this={element}
    class="search-result typo-text"
    href={`/app/drip-lists/${item.id}`}
    on:click
  >
    <span style:display="flex" style:align-items="center" style:min-width="0">
      <DripListBadge showName={false} dripList={makeFakeDripListBadgeType(item)} />
      <div class="label">
        {@html pickLabel(item)}
      </div>
    </span>
  </a>
{:else if item.type === 'address'}
  <a bind:this={element} class="search-result typo-text" href={`/app/${item.address}`} on:click>
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

  .label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .search-result :global(em) {
    font-style: normal;
    background-color: var(--color-primary-level-2);
    color: var(--color-foreground);
    border-radius: 0.2rem;
  }
</style>
