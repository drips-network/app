<script lang="ts">
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import CoinFlying from '$lib/components/icons/CoinFlying.svelte';
  import getContrastColor from '$lib/utils/get-contrast-text-color';
  import type { Component } from 'svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import EcosystemBadge from '$lib/components/ecosystem-badge/ecosystem-badge.svelte';
  import backgroundImage from './background-image';

  const { data } = $props();
  const { bgColor, type, headline, avatarSrc, stats } = $derived(data);

  const ICON_MAP: Record<string, Component<{ style?: string }>> = {
    DripList: DripListIcon,
    CoinFlying: CoinFlying,
  };

  const BADGE_CONFIG: Record<
    string,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: Component<any>;
      getProps: (data: unknown) => Record<string, unknown>;
    }
  > = {
    icon: {
      component: null as unknown as Component<Record<string, unknown>>, // Special case handled manually in the template for now, or we can make a wrapper.
      // To strictly follow the pattern, we'd need an IconWrapper component.
      // But for now, let's keep the manual check but triggered by `type === 'icon'`.
      getProps: (_) => ({}),
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

  const contrastColor = $derived(getContrastColor(bgColor));
  const renderedBgImage = $derived(backgroundImage(bgColor, contrastColor));
</script>

<div
  id="content"
  style:background-color={bgColor}
  class="share-image"
  style:height="630px"
  style:width="1200px"
>
  <div class="bg">
    {@html renderedBgImage}
  </div>

  <div class="content" style:color={contrastColor}>
    {#if avatarSrc}
      <!-- svelte-ignore a11y_missing_attribute -->
      <img src={avatarSrc} />
    {/if}

    <div class="type-and-headline">
      <span class="type">{type}</span>
      <span class="headline">{headline}</span>

      {#if (stats?.length ?? 0) > 0}
        <div class="stats">
          {#each stats as stat (stat.label)}
            <div class="stat">
              {#each stat.visuals as visual (visual)}
                {#if visual.type === 'icon'}
                  {#if ICON_MAP[visual.data]}
                    {@const Icon = ICON_MAP[visual.data]}
                    <Icon style="fill: {contrastColor}; height: 32px; width: 32px;" />
                  {/if}
                {:else if BADGE_CONFIG[visual.type]}
                  {@const config = BADGE_CONFIG[visual.type]}
                  {@const Badge = config.component}
                  <div class="badge-wrapper">
                    <Badge {...config.getProps(visual.data)} />
                  </div>
                {/if}
              {/each}
              <span class="label">{stat.label}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  @font-face {
    font-family: 'Redaction 50';
    font-weight: 400;
    font-style: normal;
    src: url('/fonts/redaction/Redaction_35-Italic.woff2') format('woff2');
  }

  @font-face {
    font-family: 'Inter Regular';
    src: url('/fonts/Inter-Regular.woff2');
    font-display: swap;
  }

  #content {
    position: relative;
  }

  .share-image {
    width: 1200px;
    height: 630px;
    background-color: #f0f0f0;
  }

  * {
    font-family: 'Inter Regular';
  }

  .content {
    position: absolute;
    bottom: 40px;
    left: 40px;
    width: 80%;
    height: 200px;
    color: white;
    display: flex;
    align-items: center;
  }

  .content img {
    border: 2px solid black;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 24px;
    flex-shrink: 0;
  }

  .type-and-headline {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .type {
    font-size: 32px;
  }

  .headline {
    font-family: 'Redaction 50';
    font-size: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stats {
    display: flex;
    gap: 24px;
    align-items: center;
    margin-top: 12px;
    font-size: 24px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid black;
    object-fit: cover;
    background-color: white;
  }

  .badge-wrapper {
    /* Ensure badges don't have unexpected margins */
    display: flex;
    align-items: center;
  }
</style>
