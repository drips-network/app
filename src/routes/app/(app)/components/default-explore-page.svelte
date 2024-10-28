<script lang="ts" context="module">
  export const DEFAULT_EXPLORE_PAGE_FEATURED_PROJECT_FRAGMENT = gql`
    ${PROJECT_CARD_FRAGMENT}
    fragment DefaultExplorePageFeaturedProject on Project {
      ...ProjectCard
      account {
        accountId
      }
      chainData {
        ... on ClaimedProjectData {
          chain
        }
        ... on UnClaimedProjectData {
          chain
        }
      }
    }
  `;

  export const DEFAULT_EXPLORE_PAGE_FEATURED_DRIP_LISTS_FRAGMENT = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    fragment DefaultExplorePageFeaturedDripLists on DripList {
      ...DripListCard
    }
  `;
</script>

<script lang="ts">
  import BoxIcon from '$lib/components/icons/Box.svelte';
  import TrophyIcon from '$lib/components/icons/Trophy.svelte';
  import EtherscanIcon from '$lib/components/icons/Etherscan.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import Section from '$lib/components/section/section.svelte';
  import ProjectCard, {
    PROJECT_CARD_FRAGMENT,
  } from '$lib/components/project-card/project-card.svelte';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import { PUBLIC_NETWORK } from '$env/static/public';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import totalDrippedApproximation, {
    cachedTotalDrippedPrices,
  } from '$lib/utils/total-dripped-approx';
  import { onDestroy, onMount } from 'svelte';
  import tickStore from '$lib/stores/tick/tick.store';
  import Box from '$lib/components/icons/Box.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import DripListCard, {
    DRIP_LIST_CARD_FRAGMENT,
  } from '$lib/components/drip-list-card/drip-list-card.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import isClaimed from '$lib/utils/project/is-claimed';
  import { gql } from 'graphql-request';
  import type {
    DefaultExplorePageFeaturedDripListsFragment,
    DefaultExplorePageFeaturedProjectFragment,
  } from './__generated__/gql.generated';
  import type { z } from 'zod';
  import type { postsListingSchema } from '../../../api/blog/posts/schema';
  import LatestNewsSection from './latest-news-section.svelte';
  import ConnectWalletPrompt from './connect-wallet-prompt.svelte';

  const FEATURED_PROJECT_ACCOUNT_IDS =
    {
      1: [
        '80921576051643469277397866636792942368647018452892810554457309839360',
        '80928956806149918791864723629668437820661066502202314166815319654400',
        '80989205010981758696261160004449877944077887004065826078532843448906',
        '80921140646830818724035150101819719966329403614944137690624336855040',
        '80912096692731427285642748238291568975884076216206760523486136893440', // nice-node
        '80927335273972468167722947750338907267861671542981060844246982983680', // starknet.js
        '80927325632295926773992520689210905998818993360029926329589912567808', // snapshot
        '80922395546375089598655709477693009806793075640399849243804470083584', // graph-node
      ],
      5: [
        '81084611675088797239845552682012929720024883823846356540336220583709',
        '80921553623925136102837120782793736893291544351678576578072673071411',
        '81084953153801269804906196669849986124054336368266435383120426750828',
        '80921553623925136102837120782793736893291544351678576578072673072128',
        '80921553623925136102837120782793736893291544351678576578072673072640',
        '80921553623925136102837120782793736893291544351678576578072673071412',
        '80921553623925136102837120782793736893291544351678576578072673071408',
        '80921553623925136102837120782793736893291544351678576578072673071616',
      ],
    }[PUBLIC_NETWORK] ?? [];

  export let projects: DefaultExplorePageFeaturedProjectFragment[];
  export let blogPosts: z.infer<typeof postsListingSchema>;
  export let featuredDripLists: DefaultExplorePageFeaturedDripListsFragment[];
  export let totalDrippedPrices: Awaited<ReturnType<typeof cachedTotalDrippedPrices>>;
  export let tlv: number;

  $: featuredProjects = projects.filter((p) =>
    FEATURED_PROJECT_ACCOUNT_IDS.includes(p.account.accountId),
  );

  // 2 latest posts. Sort by date
  $: blogPosts = blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  // Last 4 projects. TODO: sort by claim date
  $: recentlyClaimedProjects = projects.slice(-4);

  function numberWithCommas(input: number) {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  let totalDrippedAmounts: ReturnType<typeof totalDrippedApproximation>;
  function update() {
    totalDrippedAmounts = totalDrippedApproximation();
  }
  update();

  function getProjectColor(project: (typeof featuredProjects)[number]) {
    const chainData = filterCurrentChainData(project.chainData);

    if (!isClaimed(chainData)) {
      return;
    }

    return chainData.color;
  }

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
        <span class="large-number pixelated">${numberWithCommas(Math.round(tlv))}</span>
      </div>
    </div>
  </Section>

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
      <div class="projects-grid featured-projects">
        {#each featuredProjects as project}
          <div>
            {#if isClaimed(filterCurrentChainData(project.chainData))}
              <PrimaryColorThemer colorHex={getProjectColor(project)}>
                <ProjectCard {project} />
              </PrimaryColorThemer>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </Section>

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

  <Section
    header={{
      icon: BoxIcon,
      label: 'Recently claimed projects',
      actions: [
        {
          label: 'See all',
          href: '/app/projects/all',
          icon: Box,
        },
      ],
    }}
    skeleton={{ loaded: true }}
  >
    <div class="projects-grid">
      {#each recentlyClaimedProjects as project}
        <div>
          {#if isClaimed(filterCurrentChainData(project.chainData))}
            <PrimaryColorThemer colorHex={getProjectColor(project)}>
              <ProjectCard {project} />
            </PrimaryColorThemer>
          {/if}
        </div>
      {/each}
    </div>
  </Section>

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

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: 1rem;
    max-width: 100%;
    position: relative;
    padding: 4px;
  }

  .horizontal-scroll {
    overflow-x: auto;
  }

  @media (max-width: 767px) {
    .featured-projects {
      display: flex;
      gap: 1rem;
      padding: 4px;
    }

    .featured-projects > div {
      width: 14rem;
    }
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
