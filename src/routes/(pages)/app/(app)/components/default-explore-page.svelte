<script lang="ts">
  import BoxIcon from '$lib/components/icons/Box.svelte';
  import TrophyIcon from '$lib/components/icons/Trophy.svelte';
  import EtherscanIcon from '$lib/components/icons/Etherscan.svelte';
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
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';
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
          <a
            href="https://etherscan.io/address/0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4"
            target="_blank"
            rel="noreferrer"
            class="header"
          >
            <h5>Total value on Drips</h5>
            <EtherscanIcon />
          </a>
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
      <div class="drip-list-cards-grid">
        {#each featuredDripLists as dripList}
          <DripListCard listingMode data={{ dripList: dripList }} />
        {/each}
      </div>
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

  {#if projects.length > 0}
    <RecentlyClaimedProjects {projects} />
  {/if}

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
    font-size: min(12vw, 80px);
    line-height: min(12vw, 80px);
    color: var(--color-primary);
  }

  .horizontal-scroll {
    overflow-x: auto;
  }

  .drip-list-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
    gap: 1rem;
    padding: 4px 2px;
  }

  @media (max-width: 767px) {
    .drip-list-cards-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
