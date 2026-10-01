<script lang="ts">
  import { run } from 'svelte/legacy';

  import BoxIcon from '$lib/components/icons/Box.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import Section from '$lib/components/section/section.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Box from '$lib/components/icons/Box.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import type { DefaultExplorePageFeaturedProjectFragment } from './__generated__/gql.generated';
  import type { z } from 'zod';
  import type { postsListingSchema } from '../../../../api/blog/posts/schema';
  import LatestNewsSection from './latest-news-section.svelte';
  import ConnectWalletPrompt from './connect-wallet-prompt.svelte';
  import RecentlyClaimedProjects from './recently-claimed-projects.svelte';
  import ProjectsGrid from './projects-grid.svelte';
  import DripListsGrid from './drip-lists-grid.svelte';
  import type { ADripListFragment } from '../drip-lists/components/__generated__/gql.generated';
  import FeatureCard from './feature-card.svelte';
  import Button from '$lib/components/button/button.svelte';
  import PulsatingCircle from '$lib/components/pulsating-circle/pulsating-circle.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';

  interface Props {
    projects: DefaultExplorePageFeaturedProjectFragment[];
    featuredProjects: DefaultExplorePageFeaturedProjectFragment[];
    featuredWeb3Projects: DefaultExplorePageFeaturedProjectFragment[];
    blogPosts: z.infer<typeof postsListingSchema>;
    featuredDripLists: ADripListFragment[];
  }

  let {
    projects,
    featuredProjects,
    featuredWeb3Projects,
    blogPosts = $bindable(),
    featuredDripLists,
  }: Props = $props();

  // 2 latest posts. Sort by date
  run(() => {
    blogPosts = blogPosts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2);
  });
</script>

<div class="explore">
  <FeatureCard
    imageUrl="/assets/wave/wave-hp.png"
    priorityImage
    imageDimensions={{ width: 1560, height: 760 }}
  >
    <div class="highlight-badge typo-header-5">
      <PulsatingCircle pulseColor="rgba(255,255,255,0.5)" />
      NEW
    </div>

    <div>
      <h2 style:margin-bottom="0.25rem">Drips Wave: Live with Stellar</h2>
      <p>
        With Drips Wave, Stellar runs recurring one-week contribution sprints. During these Waves,
        contributors receive Points, for which they earn rewards.
      </p>
    </div>

    {#snippet actions()}
      <Button
        variant="primary"
        icon={ArrowBoxUpRight}
        href="https://www.drips.network/wave"
        target="_blank">Open Drips Wave App</Button
      >
    {/snippet}
  </FeatureCard>

  {#if featuredProjects?.length > 0}
    <Section
      header={{
        icon: BoxIcon,
        label: 'Featured projects',
        actions: [
          {
            label: 'Explore projects',
            href: '/app/projects',
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
            label: 'Explore Drip Lists',
            href: '/app/drip-lists',
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

  {#if featuredWeb3Projects?.length > 0}
    <Section
      header={{
        icon: BoxIcon,
        label: 'Featured web3 projects',
        actions: [
          {
            label: 'Explore projects',
            href: '/app/projects',
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

  .highlight-badge {
    background-color: var(--color-primary-level-2);
    color: var(--color-primary-level-6);
    width: fit-content;
    padding: 0.25rem 0.5rem 0.25rem 0.35rem;
    border-radius: 2rem 0 2rem 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .horizontal-scroll {
    overflow-x: auto;
  }
</style>
