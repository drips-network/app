<script lang="ts">
  import type { Component } from 'svelte';
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

  const BADGE_CONFIG: Record<
    string,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: Component<any>;
      getProps: (data: unknown) => Record<string, unknown>;
    }
  > = {
    'coin-flying': {
      component: CoinFlying as unknown as Component<Record<string, unknown>>,
      getProps: () => ({
        style: `fill: ${color}; height: 32px; width: 32px;`,
      }),
    },
    'drip-list-icon': {
      component: DripListIcon as unknown as Component<Record<string, unknown>>,
      getProps: () => ({
        style: `fill: ${color}; height: 32px; width: 32px;`,
      }),
    },

    identity: {
      component: IdentityBadge as unknown as Component<Record<string, unknown>>,
      getProps: (data) => ({
        address: data as string,
        showIdentity: false,
        showAvatar: true,
        size: 'medium',
        disableLink: true,
        disableTooltip: true,
      }),
    },
    'drip-list': {
      component: DripListBadge as unknown as Component<Record<string, unknown>>,
      getProps: (data) => ({
        dripList:
          data as import('$lib/components/drip-list-badge/__generated__/gql.generated').DripListBadgeFragment,
        showName: false,
        showAvatar: true,
        avatarSize: 'small',
        disabled: true,
      }),
    },
    ecosystem: {
      component: EcosystemBadge as unknown as Component<Record<string, unknown>>,
      getProps: (data) => ({
        ecosystem:
          data as import('$lib/components/ecosystem-badge/__generated__/gql.generated').EcosystemBadgeFragment,
        showName: false,
        showAvatar: true,
        avatarSize: 'small',
        disabled: true,
      }),
    },
  };
</script>

{#if BADGE_CONFIG[visual.type]}
  {@const config = BADGE_CONFIG[visual.type]}
  {@const Badge = config.component}
  <div class="badge-wrapper">
    <Badge {...config.getProps(visual.data)} />
  </div>
{/if}

<style>
  .badge-wrapper {
    /* Ensure badges don't have unexpected margins */
    display: flex;
    align-items: center;
  }
</style>
