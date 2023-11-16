<script lang="ts">
  import type { DripList } from '$lib/utils/metadata/types';
  import streamsStore from '$lib/stores/streams/streams.store';
  import { onMount } from 'svelte';
  import getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
  import { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';
  import DripListCardRepresentational from './drip-list-card-representational.svelte';
  import getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';

  export let dripList: DripList;
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

  $: listOwner = dripList.account.owner;
  $: supportStreams =
    listOwner &&
    $streamsStore &&
    streamsStore
      .getStreamsForUser(listOwner.accountId)
      .outgoing.filter((s) => s.receiver.accountId === dripList.account.accountId);

  /*
  Fetch the representational splits for the Drip List so we can display them in the card.
  */
  let representationalSplits:
    | Awaited<ReturnType<typeof getRepresentationalSplitsForAccount>>
    | undefined = undefined;

  onMount(async () => {
    representationalSplits = await getRepresentationalSplitsForAccount(
      dripList.account.accountId,
      dripList.projects,
    );
  });

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
  {representationalSplits}
  {incomingSplits}
  {supportStreams}
  {incomingSplitTotal}
/>
