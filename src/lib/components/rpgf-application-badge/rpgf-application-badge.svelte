<script lang="ts">
  import network from '$lib/stores/wallet/network';
  import type { Application } from '$lib/utils/rpgf/schemas';
  import type { ComponentProps } from 'svelte';
  import ProjectAvatar from '../project-avatar/project-avatar.svelte';

  export let application: Application;
  export let hideName = false;
  export let size: ComponentProps<ProjectAvatar>['size'] = 'small';

  $: projectSnapshot = application.dripsProjectDataSnapshot;

  $: viewTransitionName = `rpgf-application-avatar-${application.id}`;
</script>

<div class="rpgf-application-badge">
  <div
    class="avatar"
    style:view-transition-name={viewTransitionName}
    style:--transition-name={viewTransitionName}
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
  {#if !hideName}
    <span class="typo-text-bold">{application.projectName}</span>
  {/if}
</div>

<style>
  .rpgf-application-badge {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
