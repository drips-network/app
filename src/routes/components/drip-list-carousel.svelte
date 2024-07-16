<script context="module" lang="ts">
  import DripListCard, { DRIP_LIST_CARD_FRAGMENT } from "$lib/components/drip-list-card/drip-list-card.svelte";
  import { gql } from "graphql-request";
  import type { DripListCarouselDripListFragment } from "./__generated__/gql.generated";
  import { onMount } from "svelte";

  export const DRIP_LIST_CAROUSEL_DRIP_LIST_FRAGMENT = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    fragment DripListCarouselDripList on DripList {
      ...DripListCard
    }
  `;
</script>

<script lang="ts">
  import { browser } from "$app/environment";

  export let dripLists: DripListCarouselDripListFragment[];

  let currentIndex = Math.floor(dripLists.length / 2);
  const initialIndex = currentIndex;

  $: currentDripListId = dripLists[currentIndex].account.accountId;
  $: nextDripListId = (dripLists[currentIndex + 1] ?? dripLists[0]).account.accountId;
  $: previousDripListId = (dripLists[currentIndex - 1] ?? dripLists[dripLists.length - 1]).account.accountId;

  let dripListContainerElems: HTMLDivElement[] = [];

  onMount(() => {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % dripLists.length;
    }, 2000);
  })
</script>

<!-- <div
  class="typo-text-small-bold"
  style:color="var(--color-background)"
  style:padding="0 0.5rem"
  style:border-radius="1rem 0 1rem 1rem"
  style:background="var(--color-primary)"
  style:margin-bottom="-0.5rem"
  style:z-index="2"
  style:width="fit-content"
>
  Featured List
</div> -->

<div style:opacity={!browser ? '0' : '1'} class="drip-list-carousel">
  {#if browser}
    {#each dripLists as dripList, index}
      {@const id = dripList.account.accountId}
      <div
        bind:this={dripListContainerElems[index]}
        class="list"
        class:current={currentDripListId === id}
        class:next={nextDripListId === id}
        class:previous={previousDripListId === id}
      >
        <DripListCard hideDescription hideTotal listingMode data={{ dripList }} />
      </div>
    {/each}
  {/if}
  <div class="placeholder" style:visibility="hidden">
    <DripListCard hideDescription hideTotal listingMode data={{ dripList: dripLists[initialIndex] }} />
  </div>
</div>

<style>
  .drip-list-carousel {
    position: relative;
    max-width: 90vw;
    transition: opacity 0.5s;
  }

  .list {
    display: flex;
    flex-direction: column;
    visibility: hidden;
    position: absolute;
    width: 100%;
    min-width: 400px;
    pointer-events: none;
  }

  .placeholder {
    min-width: 400px;
  }

  .list.current {
    visibility: visible;
    z-index: 1;
    transition: transform 0.5s, opacity 0.5s;
  }

  .list.previous {
    visibility: visible;
    transform: translate(5rem) scale(0.9);
    opacity: 0.5;
    transition: transform 0.5s, opacity 0.5s;
  }

  .list.next {
    visibility: visible;
    transform: translate(-5rem) scale(0.9);
    opacity: 0.5;
    transition: transform 0.5s, opacity 0.5s;
  }
</style>
