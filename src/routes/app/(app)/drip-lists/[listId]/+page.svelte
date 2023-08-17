<script lang="ts">
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import Supporters from '$lib/components/supporters-section/supporters.section.svelte';
  import streamsStore from '$lib/stores/streams/streams.store';
  import type { PageData } from './$types';

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

<HeadMeta title={data.dripList.name} />

<div class="drip-list-page">
  <div class="owner">
    <span>Drip List owned by </span>
    <IdentityBadge address={data.dripList.account.owner.address} />
  </div>
  <SectionSkeleton loaded={Boolean(data.dripList)}>
    <DripListCard
      {supportStreams}
      incomingSplits={data.incomingSplits}
      dripList={data.dripList}
      representationalSplits={data.representationalSplits}
    />
  </SectionSkeleton>
  <Developer accountId={dripList.account.accountId} />
  <Supporters
    headline="Support"
    infoTooltip="A Drip List can be supported by one or more support streams by the list's owner. Others can also add a Drip List to their own Drip Lists to support it."
    forceLoading={!streamsFetched}
    {supportStreams}
    type="dripList"
    incomingSplits={data.incomingSplits}
  />
</div>

<style>
  .drip-list-page {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .owner {
    display: flex;
    gap: 0.25rem;
  }

  .owner span {
    color: var(--color-foreground-level-6);
  }
</style>
