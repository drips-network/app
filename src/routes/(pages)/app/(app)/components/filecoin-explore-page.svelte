<script lang="ts">
  import type { z } from 'zod';
  import type { postsListingSchema } from '../../../../api/blog/posts/schema';
  import LatestNewsSection from './latest-news-section.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import ConnectWalletPrompt from './connect-wallet-prompt.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import type { DefaultExplorePageFeaturedProjectFragment } from './__generated__/gql.generated';
  import RecentlyClaimedProjects from './recently-claimed-projects.svelte';
  import type { DripListCardFragment } from '$lib/components/drip-list-card/__generated__/gql.generated';
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';

  export let blogPosts: z.infer<typeof postsListingSchema>;
  export let projects: DefaultExplorePageFeaturedProjectFragment[];
  export let dripList: DripListCardFragment | null | undefined;
</script>

<div class="explore">
  <div class="hero">
    <div class="welcome-card">
      <div class="illustration">
        <div class="background" />
        <div class="filecoin-logo-wrapper">
          <img src="/assets/filecoin-logo.svg" alt="Filecoin logo" />
        </div>
      </div>
      <div class="content">
        <div style:display="flex" style:flex-direction="column" style:gap="1rem">
          <h1>Welcome to Drips on Filecoin</h1>
          <p>Drips on Filecoin is where rewards from Filecoin's RetroPGF are being distributed.</p>
        </div>
        <div>
          <Button
            href="https://fil-retropgf.notion.site/FIL-RetroPGF-4b6f5358440043c8bb1bf53f0297541e"
            target="_blank"
            icon={ArrowBoxUpRight}>Read the FIL-RetroPGF-2 docs</Button
          >
        </div>
      </div>
    </div>
    {#if dripList}
      <DripListCard listingMode={true} data={{ dripList }} maxSplitRows={5} />
    {/if}
  </div>

  <RecentlyClaimedProjects {projects} />

  <LatestNewsSection title="News from Drips" {blogPosts} />

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

  .hero {
    display: flex;
    gap: 1rem;
  }

  .hero > * {
    flex: 1 0 50%;
  }

  .welcome-card {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    border: 1px solid var(--color-foreground);
    padding: 0 1rem 1rem 1rem;
    border-radius: 2rem 0 2rem 2rem;
    overflow: hidden;
  }

  .welcome-card .illustration {
    height: 6rem;
    position: relative;
  }

  .welcome-card .illustration .background {
    background-color: var(--color-primary-level-1);
    height: 4rem;
    width: 100%;
    border-radius: 0 0 1.5rem 1.5rem;
  }

  .welcome-card .illustration .filecoin-logo-wrapper {
    position: absolute;
    top: 1.5rem;
    left: 1rem;
    height: 5rem;
    width: 5rem;
    background-color: var(--color-background);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    border: 1px solid var(--color-foreground);
    box-sizing: border-box;
  }

  .welcome-card .content {
    padding: 1rem 1rem 1rem 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: space-between;
  }

  @media (max-width: 1000px) {
    .hero {
      flex-direction: column;
    }
  }
</style>
