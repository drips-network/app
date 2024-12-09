<script lang="ts">
  import type { z } from 'zod';
  import type { metadataSchema } from '../../api/blog/posts/schema';
  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
  import type { DripListCardFragment } from '$lib/components/drip-list-card/__generated__/gql.generated';
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';
  import { onMount } from 'svelte';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import CoinAnimation from '$lib/components/coin-animation/coin-animation.svelte';

  export let blogPost:
    | (Pick<z.infer<typeof metadataSchema>, 'title' | 'coverImage' | 'coverImageAlt'> & {
        slug: string;
      })
    | undefined;
  export let orgName: string;
  export let logoSrc: string;
  export let logoAlt: string;
  export let description: string;
  export let dripList: DripListCardFragment | undefined;
  export let maxSplitRows: number | undefined = undefined;

  onMount(fiatEstimates.start);
</script>

<div class="case-study-card">
  <div class="left">
    <div class="description typo-text">
      <div class="logo-wrapper">
        <CoinAnimation playSound><img src={logoSrc} alt={logoAlt} /></CoinAnimation>
      </div>
      <h3 class="typo-header-1">{orgName}</h3>
      <p>{description}</p>
    </div>
    {#if blogPost}
      <a class="typo-text-small" href={`/blog/posts/${blogPost.slug}`} target="_blank">
        <div>
          <img src={blogPost.coverImage} alt={blogPost.coverImageAlt} />
          {blogPost.title}
        </div>
        <ChevronRight style="fill: var(--color-foreground)" />
      </a>
    {/if}
  </div>
  {#if dripList}
    <div class="list">
      <DripListCard
        {maxSplitRows}
        hideSupporterPile
        openInNewTab
        clampTitle={false}
        hideDescription
        listingMode={true}
        data={{ dripList }}
      />
    </div>
  {/if}
</div>

<style>
  .case-study-card {
    text-align: left;
    padding: 1.5rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    background-color: var(--color-background);
    min-height: 461px;
    align-items: stretch;
  }

  .logo-wrapper {
    width: 3rem;
    height: 3rem;
  }

  .list {
    flex: 1 1 0;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
    max-width: 32rem;
  }

  .case-study-card .left {
    flex: 1 1 0;
    display: flex;
    gap: 1.5rem;
    justify-content: space-between;
    flex-direction: column;
  }

  .description {
    display: flex;
    gap: 1.5rem;
    flex-direction: column;
    max-width: 32rem;
  }

  .description img {
    width: 3rem;
    height: 3rem;
  }

  a {
    border: 1px solid var(--color-foreground);
    padding: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    justify-content: space-between;
    max-width: 32rem;
  }

  a > div {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  a img {
    width: 5rem;
    border-radius: 0.25rem 0 0.25rem 0.25rem;
  }

  @media (max-width: 882px) {
    .case-study-card {
      flex-direction: column;
      padding: 0.75rem;
    }

    .list {
      flex: initial;
      max-width: none;
    }
  }
</style>
