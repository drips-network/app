<script lang="ts" context="module">
  export const DRIP_LIST_PAGE_FRAGMENT = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    ${SUPPORT_CARD_DRIP_LIST_FRAGMENT}
    ${SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT}
    fragment DripListPage on DripList {
      ...DripListCard
      ...SupportCardDripList
      account {
        accountId
      }
      owner {
        accountId
        address
      }
      support {
        ...SupportersSectionSupportItem
      }
    }
  `;
</script>

<script lang="ts">
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import SupportCard, {
    SUPPORT_CARD_DRIP_LIST_FRAGMENT,
  } from '$lib/components/support-card/support-card.svelte';
  import Supporters, {
    SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT,
  } from '$lib/components/supporters-section/supporters.section.svelte';
  import streamsStore from '$lib/stores/streams/streams.store';
  import type { PageData } from './$types';
  import DripListCard, {
    DRIP_LIST_CARD_FRAGMENT,
  } from '$lib/components/drip-list-card/drip-list-card.svelte';
  import { gql } from 'graphql-request';

  export let data: PageData;

  $: dripList = data.dripList;

  $: ownerAccountId = dripList.owner.accountId;
  $: supportStreams =
    $streamsStore &&
    streamsStore
      .getStreamsForUser(ownerAccountId)
      .outgoing.filter((s) => s.receiver.accountId === dripList.account.accountId);

  const streamsFetchStatusses = streamsStore.fetchStatusses;
  $: streamsFetched = $streamsFetchStatusses[ownerAccountId] === 'fetched';
</script>

{#if data.dripList.name}
  {@const imageBaseUrl = `/api/share-images/drip-list/${dripList.account.accountId}.png`}
  <HeadMeta
    title="{data.dripList.name} | Drip List"
    description={data.dripList.description ?? undefined}
    image="{imageBaseUrl}?target=og"
    twitterImage="{imageBaseUrl}?target=twitter"
  />
{/if}

<article class="drip-list-page">
  <main class="list">
    <SectionSkeleton loaded={Boolean(data.dripList)} horizontalScroll={false}>
      <DripListCard dripList={data.dripList} />
    </SectionSkeleton>
  </main>

  <aside class="support">
    <div>
      <SupportCard {dripList} />
    </div>
  </aside>

  <div class="sections">
    <Developer accountId={dripList.account.accountId} />

    <Supporters
      accountId={dripList.account.accountId}
      headline="Support"
      infoTooltip="A Drip List can be supported by one or more support streams by the list's owner. Others can also add a Drip List to their own Drip Lists or project's dependencies, or send a one-time donation."
      forceLoading={!streamsFetched}
      {supportStreams}
      type="dripList"
      supportItems={data.dripList.support}
      ownerAccountId={data.dripList.owner.accountId}
    />
  </div>
</article>

<style>
  .drip-list-page {
    display: grid;
    grid-template-columns: 1fr minmax(auto, 18rem);
    grid-template-rows: auto auto;
    grid-template-areas:
      'list support'
      'sections support';
    gap: 3rem;
  }

  .drip-list-page > * {
    min-width: 0;
  }

  .list {
    grid-area: list;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .support {
    grid-area: support;
    grid-row: 1 / span 2;
  }

  .support > div {
    position: sticky;
    top: 6rem;
  }

  .sections {
    grid-area: sections;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  @media (max-width: 1080px) {
    .drip-list-page {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      grid-template-areas:
        'list'
        'support'
        'sections';
      min-width: 0;
    }

    .support > div {
      margin-top: 0;
      position: relative;
      top: 0;
    }

    .drip-list-page > * {
      min-width: 0;
    }

    .support {
      grid-row: auto;
    }
  }
</style>
