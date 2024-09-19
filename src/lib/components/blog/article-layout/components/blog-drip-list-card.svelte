<script lang="ts">
  import DripListCard, {
    DRIP_LIST_CARD_FRAGMENT,
  } from '$lib/components/drip-list-card/drip-list-card.svelte';
  import { gql } from 'graphql-request';
  import { onMount } from 'svelte';
  import type {
    BlogDripListQuery,
    BlogDripListQueryVariables,
  } from './__generated__/gql.generated';
  import query from '$lib/graphql/dripsQL';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';

  export let dripListId: string;

  let dripList: BlogDripListQuery['dripList'] | undefined = undefined;

  onMount(async () => {
    await fiatEstimates.start();

    const blogDripListQuery = gql`
      ${DRIP_LIST_CARD_FRAGMENT}
      query blogDripList($dripListId: ID!) {
        dripList(id: $dripListId) {
          ...DripListCard
        }
      }
    `;

    dripList = (
      await query<BlogDripListQuery, BlogDripListQueryVariables>(blogDripListQuery, { dripListId })
    ).dripList;
  });
</script>

<div data-custom-blog-component>
  <div class="wrapper">
    {#if dripList}
      <DripListCard listingMode data={{ dripList }} />
    {/if}
  </div>
</div>

<style>
  .wrapper {
    width: calc(100% + 4rem);
    border: 1px solid var(--color-foreground);
    border-radius: 2rem 0 2rem 2rem;
    margin: 2.5rem -2rem;
    padding: 0.5rem;
    overflow: hidden;
  }

  @media (max-width: 797px) {
    .wrapper {
      width: 100%;
      margin: 2.5rem 0;
    }
  }
</style>
