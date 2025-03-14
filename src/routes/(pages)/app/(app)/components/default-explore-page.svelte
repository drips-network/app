<script lang="ts">
  import BoxIcon from '$lib/components/icons/Box.svelte';
  import TrophyIcon from '$lib/components/icons/Trophy.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import Section from '$lib/components/section/section.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import totalDrippedApproximation, {
    cachedTotalDrippedPrices,
  } from '$lib/utils/total-dripped-approx';
  import { onDestroy, onMount } from 'svelte';
  import tickStore from '$lib/stores/tick/tick.store';
  import Box from '$lib/components/icons/Box.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import type {
    DefaultExplorePageFeaturedProjectFragment,
    ExplorePageFeaturedDripListsFragment,
  } from './__generated__/gql.generated';
  import type { z } from 'zod';
  import type { postsListingSchema } from '../../../../api/blog/posts/schema';
  import LatestNewsSection from './latest-news-section.svelte';
  import ConnectWalletPrompt from './connect-wallet-prompt.svelte';
  import RecentlyClaimedProjects from './recently-claimed-projects.svelte';
  import ProjectsGrid from './projects-grid.svelte';
  import { NETWORK_CONFIG } from '$lib/stores/wallet/network';
  import DripListsGrid from './drip-lists-grid.svelte';

  export let projects: DefaultExplorePageFeaturedProjectFragment[];
  export let featuredProjectIds: string[] | undefined = undefined;
  export let featuredWeb3ProjectIds: string[] | undefined = undefined;
  export let blogPosts: z.infer<typeof postsListingSchema>;
  export let featuredDripLists: ExplorePageFeaturedDripListsFragment[];
  export let totalDrippedPrices: Awaited<ReturnType<typeof cachedTotalDrippedPrices>>;
  export let tlv: number;

  $: featuredWeb3Projects = projects.filter((p) =>
    featuredWeb3ProjectIds?.includes(p.account.accountId),
  );

  $: featuredProjects = projects.filter((p) => featuredProjectIds?.includes(p.account.accountId));

  // 2 latest posts. Sort by date
  $: blogPosts = blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  let totalDrippedAmounts: ReturnType<typeof totalDrippedApproximation>;
  function update() {
    totalDrippedAmounts = totalDrippedApproximation();
  }
  update();

  $: formattedTlv = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(tlv));

  let tickHandle: number;
  onMount(async () => {
    tickHandle = tickStore.register(update);
  });
  onDestroy(() => {
    tickStore.deregister(tickHandle);
  });

  $: enabledNetworks = Object.values(NETWORK_CONFIG).filter((v) => !v.isTestnet);
</script>

<div class="explore">
  <Section
    header={{
      icon: TrophyIcon,
      label: 'Stats',
    }}
    skeleton={{
      loaded: true,
      horizontalScroll: false,
    }}
  >
    <div class="stats">
      <div class="value-wrapper">
        <div class="header">
          <h5>Total dripped</h5>
        </div>
        <span class="large-number pixelated"
          ><AggregateFiatEstimate amounts={totalDrippedAmounts} prices={totalDrippedPrices} /></span
        >
      </div>
      {#if typeof tlv === 'number'}
        <div class="value-wrapper">
          <div class="header">
            <h5>Total value on Drips</h5>
            <div class="explorer-icons">
              {#each enabledNetworks as network}
                <a
                  href="{network.explorer.base}/address/{network.contracts.DRIPS}"
                  target="_blank"
                  rel="noreferrer"
                  class="header"
                >
                  <svelte:component this={network.icon} />
                </a>
              {/each}
            </div>
          </div>
          <span class="large-number pixelated">{formattedTlv}</span>
        </div>
      {/if}
    </div>
  </Section>

  {#if featuredProjectIds}
    <Section
      header={{
        icon: BoxIcon,
        label: 'Featured projects',
        actions: [
          {
            label: 'See all',
            href: '/app/projects/all',
            icon: Box,
          },
        ],
      }}
      skeleton={{
        loaded: true,
      }}
    >
      <div class="horizontal-scroll">
        <ProjectsGrid projects={featuredProjects} />
      </div>
    </Section>
  {/if}

  {#if featuredDripLists?.length > 0}
    <Section
      header={{
        icon: DripListIcon,
        label: 'Featured Drip Lists',
        actions: [
          {
            label: 'See all',
            href: '/app/drip-lists/all',
            icon: DripList,
          },
        ],
      }}
      skeleton={{
        loaded: true,
      }}
    >
      <DripListsGrid dripLists={featuredDripLists} />
    </Section>
  {/if}

  {#if featuredWeb3ProjectIds}
    <Section
      header={{
        icon: BoxIcon,
        label: 'Featured web3 projects',
        actions: [
          {
            label: 'See all',
            href: '/app/projects/all',
            icon: Box,
          },
        ],
      }}
      skeleton={{
        loaded: true,
      }}
    >
      <div class="horizontal-scroll">
        <ProjectsGrid projects={featuredWeb3Projects} />
      </div>
    </Section>
  {/if}

  <RecentlyClaimedProjects {projects} />

  <LatestNewsSection {blogPosts} />

  {#if !$walletStore.connected}
    <ConnectWalletPrompt />
  {/if}
</div>

<style>
  .explore {
    display: flex;
    gap: 3rem;
    flex-direction: column;
  }

  .stats {
    display: flex;
    gap: 1rem;
  }

  .stats .value-wrapper {
    border: 1px solid var(--color-foreground);
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .stats .value-wrapper .header .explorer-icons {
    display: flex;
    gap: 0.25rem;
  }

  .stats .value-wrapper .header .explorer-icons a {
    opacity: 0.5;
    transition: 0.3s;
  }

  .stats .value-wrapper .header .explorer-icons a:focus-visible,
  .stats .value-wrapper .header .explorer-icons a:hover {
    opacity: 1;
  }

  @media (max-width: 1070px) {
    .stats {
      flex-direction: column;
    }

    .stats .value-wrapper {
      width: 100%;
    }
  }

  .stats .value-wrapper .header {
    display: flex;
    justify-content: space-between;
  }

  .large-number {
    font-size: min(11vw, 70px);
    line-height: min(12vw, 80px);
    color: var(--color-primary);
  }

  .horizontal-scroll {
    overflow-x: auto;
  }
</style>
