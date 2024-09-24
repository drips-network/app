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
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { fade } from 'svelte/transition';
  import network from '$lib/stores/wallet/network';

  export let dripListId: string;

  let dripList: BlogDripListQuery['dripList'] | undefined = undefined;

  onMount(async () => {
    await fiatEstimates.start();

    const blogDripListQuery = gql`
      ${DRIP_LIST_CARD_FRAGMENT}
      query blogDripList($dripListId: ID!, $chain: SupportedChain!) {
        dripList(id: $dripListId, chain: $chain) {
          ...DripListCard
        }
      }
    `;

    dripList = (
      await query<BlogDripListQuery, BlogDripListQueryVariables>(blogDripListQuery, {
        dripListId,
        chain: network.gqlName,
      })
    ).dripList;
  });
</script>

<div data-custom-blog-component>
  <div class="wrapper">
    <TransitionedHeight transitionHeightChanges>
      {#if dripList}
        <div in:fade><DripListCard listingMode data={{ dripList }} /></div>
      {:else}
        <div class="loading"><Spinner /></div>
      {/if}
    </TransitionedHeight>
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

  .loading {
    height: 22.765rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 797px) {
    .wrapper {
      width: 100%;
      margin: 2.5rem 0;
    }
  }
</style>
