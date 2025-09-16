<script lang="ts">
  import network from '$lib/stores/wallet/network';
  import type { ComponentProps } from 'svelte';
  import ProjectAvatar from '../project-avatar/project-avatar.svelte';
  import type { ListingApplication } from '$lib/utils/rpgf/types/application';

  export let application: ListingApplication;
  export let hideName = false;
  export let hideAvatar = false;
  export let hideState = false;
  export let inline = false;
  export let size: ComponentProps<ProjectAvatar>['size'] = 'small';
  export let excludeFromViewTransition = false;

  $: projectSnapshot = application.dripsProjectDataSnapshot;

  $: viewTransitionName = `rpgf-application-avatar-${application.id}`;

  const stateMap: Record<ListingApplication['state'], string> = {
    pending: 'Pending review',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  const stateColors: Record<ListingApplication['state'], string> = {
    pending: '--color-caution',
    approved: '--color-positive',
    rejected: '--color-negative',
  };
</script>

<div class="rpgf-application-badge" style:display={inline ? 'inline-flex' : 'flex'}>
  {#if !hideAvatar}
    <div
      class="avatar"
      style:view-transition-name={excludeFromViewTransition ? undefined : viewTransitionName}
      style:view-transition-class={excludeFromViewTransition ? undefined : 'element-handover'}
    >
      <ProjectAvatar
        {size}
        project={{
          __typename: 'ClaimedProjectData',
          chain: network.gqlName,
          color: projectSnapshot.color,
          avatar:
            'emoji' in projectSnapshot.avatar
              ? { __typename: 'EmojiAvatar', emoji: projectSnapshot.avatar.emoji }
              : { __typename: 'ImageAvatar', cid: projectSnapshot.avatar.cid },
        }}
      />
    </div>
  {/if}

  {#if !hideName}
    <span class="name typo-text-bold">{application.projectName}</span>
  {/if}

  {#if !hideState}
    <span
      class="state-badge typo-header-5"
      style:background-color="var({stateColors[application.state]}-level-1)"
      style:color="var({stateColors[application.state]}-level-6)"
    >
      {stateMap[application.state]}
    </span>
  {/if}
</div>

<style>
  .rpgf-application-badge {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    vertical-align: middle;
  }

  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .state-badge {
    padding: 0.125rem 0.4rem;
    font-size: 0.65rem;
    border-radius: 1rem 0 1rem 1rem;
  }
</style>
