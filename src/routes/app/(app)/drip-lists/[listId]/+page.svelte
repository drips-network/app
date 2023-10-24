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
  <section class="flex flex-col gap-6">
    <div class="owner">
      <span>Drip List owned by </span>
      <IdentityBadge address={data.dripList.account.owner.address} />
    </div>

    <SectionSkeleton loaded={Boolean(data.dripList)} horizontalScroll={false}>
      <div class="list-and-support">
        <div class="list">
          <DripListCard dripList={data.dripList} />
        </div>
        <div class="support">
          <SupportCard {dripList} />
        </div>
      </div>
    </SectionSkeleton>
  </section>

  <Developer accountId={dripList.account.accountId} />

  <Supporters
    headline="Support"
    infoTooltip="A Drip List can be supported by one or more support streams by the list's owner. Others can also add a Drip List to their own Drip Lists or project's dependencies to support it."
    forceLoading={!streamsFetched}
    {supportStreams}
    type="dripList"
    incomingSplits={data.incomingSplits}
  />
</article>

<style>
  .drip-list-page {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .list-and-support {
    padding: 2px 0 8px 0;
    display: flex;
    gap: 1rem;
  }

  .list-and-support .list {
    flex-grow: 1;
    width: 100%;
  }

  .list-and-support .support {
    flex-grow: 0;
    max-width: 18rem;
    align-self: top;
  }

  .owner {
    display: flex;
    gap: 0.25rem;
  }

  .owner span {
    color: var(--color-foreground-level-6);
  }

  @media (max-width: 1252px) {
    .list-and-support {
      flex-direction: column;
    }
  }
</style>
