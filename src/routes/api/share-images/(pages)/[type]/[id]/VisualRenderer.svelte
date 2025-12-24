<script lang="ts">
  import type { VisualBadge } from './types';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import EcosystemBadge from '$lib/components/ecosystem-badge/ecosystem-badge.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import CoinFlying from '$lib/components/icons/CoinFlying.svelte';

  interface Props {
    visual: VisualBadge;
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
    <DripListBadge
      dripList={visual.data}
      showName={false}
      showAvatar={true}
      avatarSize="small"
      disabled={true}
    />
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
