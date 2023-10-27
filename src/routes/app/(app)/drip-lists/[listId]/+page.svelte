<script lang="ts">
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import SupportCard from '$lib/components/support-card/support-card.svelte';
  import Supporters from '$lib/components/supporters-section/supporters.section.svelte';
  import streamsStore from '$lib/stores/streams/streams.store';
  import type { PageData } from './$types';
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';

  export let data: PageData;

  $: dripList = data.dripList;

  $: ownerAccountId = dripList.account.owner.accountId;
  $: supportStreams =
    $streamsStore &&
    streamsStore
      .getStreamsForUser(ownerAccountId)
      .outgoing.filter((s) => s.receiver.accountId === dripList.account.accountId);

  const streamsFetchStatusses = streamsStore.fetchStatusses;
  $: streamsFetched = $streamsFetchStatusses[ownerAccountId] === 'fetched';
</script>

{#if data.dripList.name}
  <HeadMeta title={data.dripList.name} />
{/if}

<article class="drip-list-page">
  <main class="list">
    <div class="owner">
      <span>Drip List owned by </span>
      <IdentityBadge address={data.dripList.account.owner.address} />
    </div>
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
      headline="Support"
      infoTooltip="A Drip List can be supported by one or more support streams by the list's owner. Others can also add a Drip List to their own Drip Lists or project's dependencies to support it."
      forceLoading={!streamsFetched}
      {supportStreams}
      type="dripList"
      incomingSplits={data.incomingSplits}
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
    margin-top: 3.5rem;
    position: sticky;
    top: 6rem;
  }

  .sections {
    grid-area: sections;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .owner {
    display: flex;
    gap: 0.25rem;
  }

  .owner span {
    color: var(--color-foreground-level-6);
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
