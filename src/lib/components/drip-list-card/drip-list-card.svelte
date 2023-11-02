<script lang="ts" context="module">
  export const DRIP_LIST_CARD_FRAGMENT = gql`
    ${DRIP_LIST_CARD_REPRESENTATIONAL_LIST_FRAGMENT}
    fragment DripListCard on DripList {
      ...DripListCardRepresentationalList
    }
  `;
</script>

<script lang="ts">
  import streamsStore from '$lib/stores/streams/streams.store';
  import { onMount } from 'svelte';
  import getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
  import DripListCardRepresentational, { DRIP_LIST_CARD_REPRESENTATIONAL_LIST_FRAGMENT } from './drip-list-card-representational.svelte';
  import getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';
  import { gql } from 'graphql-request';
  import type { DripListCardFragment } from './__generated__/gql.generated';

  export let dripList: DripListCardFragment;
  export let format: 'thumblink' | 'full' = 'full';

  /*
    On mount, ensure the streams store has fetched the owner's account so that we can be sure that
    any support streams appear as expected.
    Then, select the support streams that are streaming to the list.
  */
  onMount(async () => {
    if (!$streamsStore.accounts[listOwner.accountId]) {
      await streamsStore.fetchAccount(listOwner.accountId);
    }
  });

  $: listOwner = dripList.owner;
  $: supportStreams =
    listOwner &&
    $streamsStore &&
    streamsStore
      .getStreamsForUser(listOwner.accountId)
      .outgoing.filter((s) => s.receiver.accountId === dripList.account.accountId);

      $: console.log(listOwner)

  /*
  Fetch any incoming splits so that we can display which other Drip Lists are currently supporting
  the given list.
  */
  let incomingSplits: Awaited<ReturnType<typeof getIncomingSplits>> | undefined;
  onMount(async () => {
    incomingSplits = await getIncomingSplits(dripList.account.accountId);
  });

  let incomingSplitTotal: Awaited<ReturnType<typeof getIncomingSplitTotal>> | undefined = undefined;
  onMount(async () => {
    incomingSplitTotal = await getIncomingSplitTotal(dripList.account.accountId);
  });
</script>

<DripListCardRepresentational
  {format}
  {dripList}
  {incomingSplits}
  {supportStreams}
  {incomingSplitTotal}
/>
