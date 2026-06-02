<script lang="ts">
  import Pile from '$lib/components/pile/pile.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import formatNumber from '$lib/utils/format-number';
  import type { EfpCommonFollower, EfpStats } from '$lib/utils/efp';
  import network from '$lib/stores/wallet/network';

  interface Props {
    address: string;
    stats?: EfpStats | null;
    commonFollowers?: EfpCommonFollower[];
    showCommonFollowers?: boolean;
    maxCommonFollowers?: number;
  }

  let {
    address,
    stats = null,
    commonFollowers = [],
    showCommonFollowers = false,
    maxCommonFollowers = 5,
  }: Props = $props();

  const profileUrl = $derived(`https://efp.app/${encodeURIComponent(address)}`);

  const hasStats = $derived(
    !!stats && (stats.followers > 0 || stats.following > 0),
  );

  const visibleCommonFollowers = $derived(
    showCommonFollowers ? commonFollowers.slice(0, maxCommonFollowers) : [],
  );

  const showCommon = $derived(visibleCommonFollowers.length > 0);

  const pileComponents = $derived(
    visibleCommonFollowers.map((follower) => ({
      component: IdentityBadge,
      props: {
        address: follower.address,
        disableLink: false,
        disableTooltip: true,
        size: 'small' as const,
      },
    })),
  );
</script>

{#if network.enableEfp && (hasStats || showCommon)}
  <div class="efp-stats typo-text-small">
    {#if hasStats && stats}
      <a class="counts" href={profileUrl} target="_blank" rel="noopener noreferrer">
        {formatNumber(stats.followers)} {stats.followers === 1 ? 'follower' : 'followers'} · {formatNumber(stats.following)} following
      </a>
    {/if}
    {#if showCommon}
      <div class="common-followers">
        <span class="label typo-all-caps">Followers you know</span>
        <Pile components={pileComponents} maxItems={maxCommonFollowers} countOverride={commonFollowers.length} />
      </div>
    {/if}
  </div>
{/if}

<style>
  .efp-stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--color-foreground-level-5);
  }

  .counts {
    color: var(--color-foreground-level-5);
    text-decoration: none;
  }

  .counts:hover {
    color: var(--color-primary);
    text-decoration: underline;
  }

  .common-followers {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .label {
    color: var(--color-foreground-level-4);
  }
</style>
