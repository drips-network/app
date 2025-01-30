<script lang="ts" context="module">
  export const IDENTITY_CARD_DRIP_LIST_FRAGMENT = gql`
    fragment IdentityCardDripList on DripList {
      account {
        accountId
      }
      name
      isVisible
    }
  `;
  export const IDENTITY_CARD_PROJECT_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    ${PROJECT_AVATAR_FRAGMENT}
    fragment IdentityCardProject on Project {
      ...ProjectBadge
      source {
        repoName
      }
      isVisible
      chainData {
        ...ProjectAvatar
        ... on ClaimedProjectData {
          owner {
            address
          }
        }
      }
    }
  `;
</script>

<script lang="ts">
  import { fade } from 'svelte/transition';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import { gql } from 'graphql-request';
  import type {
    IdentityCardDripListFragment,
    IdentityCardProjectFragment,
  } from './__generated__/gql.generated';
  import ProjectAvatar, {
    PROJECT_AVATAR_FRAGMENT,
  } from '$lib/components/project-avatar/project-avatar.svelte';
  import { PROJECT_BADGE_FRAGMENT } from '$lib/components/project-badge/project-badge.svelte';
  import Github from '$lib/components/icons/Github.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import WarningIcon from '$lib/components/icons/ExclamationCircle.svelte';

  // Either pass address, dripList, or project. Otherwise it will say "TBD" as a placeholder.
  export let address: string | undefined = undefined;
  export let dripList: IdentityCardDripListFragment | undefined = undefined;
  export let project: IdentityCardProjectFragment | undefined = undefined;
  export let loading = false;
  export let title: string | undefined = undefined;
  export let disableLink = false;

  let avatarImgElem: HTMLImageElement | undefined;

  $: link = disableLink
    ? undefined
    : dripList
      ? `/app/drip-lists/${dripList.account.accountId}`
      : `/app/${address}`;
</script>

<svelte:element
  this={!link || loading ? 'div' : 'a'}
  href={link ? link : undefined}
  class="identity-card"
>
  {#if title}<p class="title typo-all-caps">{title}</p>{/if}
  {#if address}
    <div class="content-container" in:fade>
      <IdentityBadge
        disableLink={true}
        size="huge"
        bind:avatarImgElem
        {address}
        showIdentity={false}
        disableTooltip
      />
      <IdentityBadge disableLink={true} size="huge" {address} showAvatar={false} disableTooltip />
    </div>
  {:else if dripList}
    <div class="content-container" in:fade>
      <div class="icon">
        <DripListIcon style="fill: var(--color-primary); height: 3rem; width: 3rem;" />
      </div>

      <div>
        <span class="typo-header-3 ellipsis" class:hidden-by-user={!dripList.isVisible}
          >{dripList.name}</span
        >
        {#if !dripList?.isVisible}
          <WarningIcon
            style="height: 1.25rem; width: 1.25rem; fill: var(--color-caution-level-6); display: inline"
          />
        {/if}
      </div>
    </div>
  {:else if project}
    <div class="content-container" in:fade class:hidden-by-user={!project.isVisible}>
      <div class="flex">
        {#if 'owner' in project}
          <div class="-mr-[5%]">
            <ProjectAvatar project={filterCurrentChainData(project.chainData)} size="large" />
          </div>
        {/if}
        <div class="h-16 w-16 bg-foreground-level-1 flex items-center justify-center rounded-full">
          <Github style="width:60%;height:60%" />
        </div>
      </div>
      <span class="typo-header-3 ellipsis"
        >{#if !project?.isVisible}
          <WarningIcon
            style="height: 1.25rem; width: 1.25rem; fill: var(--color-foreground-level-4); display: inline"
          />
        {/if}{project.source.repoName}</span
      >
    </div>
  {:else if loading}
    <div class="spinner"><Spinner /></div>
  {:else}
    <div class="avatar-placeholder" />
    <h3 class="name-placeholder">TBD</h3>
  {/if}
</svelte:element>

<style>
  .identity-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.75rem;
    border-radius: 1rem 0 1rem 1rem;
    user-select: none;
    width: 12rem;
    box-shadow: var(--elevation-medium);
    min-height: 11rem;
    position: relative;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .identity-card > * {
    width: 100%;
    text-align: left;
  }

  .title {
    margin-bottom: 0.5rem;
    line-height: 16px;
    color: var(--color-foreground);
  }

  .avatar-placeholder {
    height: 64px;
    width: 64px;
    background-color: var(--color-foreground-level-2);
    border-radius: 32px;
  }

  .name-placeholder {
    color: var(--color-foreground-level-5);
  }

  .spinner {
    flex: 1;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon {
    height: 4rem;
    width: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-primary-level-1);
    border-radius: 50%;
  }

  .ellipsis {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hidden-by-user {
    opacity: 0.5;
  }
</style>
