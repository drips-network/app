<script lang="ts">
  import type { ShareImageVisual } from './types';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import EcosystemBadge from '$lib/components/ecosystem-badge/ecosystem-badge.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import CoinFlying from '$lib/components/icons/CoinFlying.svelte';

  interface Props {
    visual: ShareImageVisual;
    color: string;
  }

  let { visual, color }: Props = $props();
</script>

<div class="badge-wrapper">
  {#if visual.type === 'coin-flying'}
    <CoinFlying style="fill: {color}; height: 32px; width: 32px;" />
  {:else if visual.type === 'drip-list-icon'}
    <DripListIcon style="fill: {color}; height: 32px; width: 32px;" />
  {:else if visual.type === 'identity'}
    <IdentityBadge
      address={visual.data}
      showIdentity={false}
      showAvatar={true}
      size="medium"
      disableLink={true}
      disableTooltip={true}
    />
  {:else if visual.type === 'drip-list'}
    <div style="display: flex; align-items: center; gap: 8px;">
      <div
        style="
        height: 32px;
        width: 32px;
        background-color: transparent;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid {color};
      "
      >
        <DripListIcon style="fill: {color}; height: 80%; width: 80%;" />
      </div>
      <span style="font-size: 24px; color: {color}; white-space: nowrap;">
        {visual.data.name}
      </span>
    </div>
  {:else if visual.type === 'ecosystem'}
    <EcosystemBadge
      ecosystem={visual.data}
      showName={false}
      showAvatar={true}
      avatarSize="small"
      disabled={true}
    />
  {/if}
</div>

<style>
  .badge-wrapper {
    /* Ensure badges don't have unexpected margins */
    display: flex;
    align-items: center;
  }
</style>
