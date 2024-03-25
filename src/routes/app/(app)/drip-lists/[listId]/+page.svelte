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
  $: votingRound = data.votingRounds.current;

  $: ownerAccountId = dripList?.owner.accountId ?? votingRound?.publisherAddress;
  $: supportStreams =
    dripList &&
    ownerAccountId &&
    $streamsStore &&
    streamsStore
      .getStreamsForUser(ownerAccountId)
      .outgoing.filter((s) => s.receiver.accountId === dripList?.account.accountId);

  const streamsFetchStatusses = streamsStore.fetchStatusses;
  $: streamsFetched =
    dripList && ownerAccountId && $streamsFetchStatusses[ownerAccountId] === 'fetched';
</script>

{#if dripList?.name || votingRound?.name}
  {@const imageBaseUrl = `/api/share-images/drip-list/${
    dripList?.account.accountId || votingRound?.id
  }.png`}
  <HeadMeta
    title="{dripList?.name || votingRound?.name} | Drip List"
    description={dripList?.description ?? votingRound?.name ?? undefined}
    image="{imageBaseUrl}?target=og"
    twitterImage="{imageBaseUrl}?target=twitter"
  />
{/if}

<article class="drip-list-page">
  <main class="list">
    <SectionSkeleton loaded={Boolean(dripList || votingRound)} horizontalScroll={false}>
      <DripListCard data={{ dripList, votingRound }} />
    </SectionSkeleton>
  </main>

  {#if dripList}
    <aside class="support">
      <div>
        <SupportCard {dripList} />
      </div>
    </aside>
  {/if}

  <div class="sections">
    {#if dripList}
      <Developer accountId={dripList.account.accountId} />
    {/if}

    {#if dripList}
      <Supporters
        accountId={dripList.account.accountId}
        headline="Support"
        infoTooltip="A Drip List can be supported by one or more support streams by the list's owner. Others can also add a Drip List to their own Drip Lists or project's dependencies, or send a one-time donation."
        forceLoading={!streamsFetched}
        supportStreams={supportStreams || undefined}
        type="dripList"
        supportItems={dripList.support}
        ownerAccountId={dripList.owner.accountId}
      />
    {/if}

    {#if data.votingRounds.past.length > 0}
      <!-- TODO: past voting rounds component -->
      {JSON.stringify(data.votingRounds.past)}
    {/if}
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
