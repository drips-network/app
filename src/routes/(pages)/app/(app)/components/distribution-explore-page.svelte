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
  import network from '$lib/stores/wallet/network';

  export let blogPosts: z.infer<typeof postsListingSchema>;
  export let projects: DefaultExplorePageFeaturedProjectFragment[] | null | undefined;
  export let dripList: DripListCardFragment | null | undefined;
  export let welcomeCard: {
    title: string;
    description: string;
    docsButton?: {
      label: string;
      href: string;
    };
  };
</script>

<div class="explore">
  {#if welcomeCard || dripList}
    <div class="hero">
      {#if welcomeCard}
        <div class="welcome-card">
          <div class="illustration">
            <div class="background" />
            <div class="filecoin-logo-wrapper">
              <svelte:component this={network.icon} style="height: 3rem; width: 3rem;" />
            </div>
          </div>
          <div class="content">
            <div style:display="flex" style:flex-direction="column" style:gap="1rem">
              <h1>{welcomeCard.title}</h1>
              <p>{welcomeCard.description}</p>
            </div>
            {#if welcomeCard.docsButton}
              {@const docsButton = welcomeCard.docsButton}
              <div>
                <Button href={docsButton.href} target="_blank" icon={ArrowBoxUpRight}
                  >{docsButton.label}</Button
                >
              </div>
            {/if}
          </div>
        </div>
      {/if}
      {#if dripList}
        <DripListCard listingMode={true} data={{ dripList }} maxSplitRows={5} />
      {/if}
    </div>
  {/if}

  {#if projects}
    <RecentlyClaimedProjects {projects} />
  {/if}

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
    gap: 2.75rem;
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
