<script lang="ts">
  import type { DripList } from '$lib/utils/metadata/types';
  import type { Splits as RepresentationalSplits } from '$lib/components/splits/splits.svelte';
  import DripListService from '$lib/utils/driplist/DripListService';
  import assert from '$lib/utils/assert';
  import { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';
  import Ledger from 'radicle-design-system/icons/Ledger.svelte';
  import { goto } from '$app/navigation';
  import DripListCard from '../drip-list-card/drip-list-card.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
  import Section from '../section/section.svelte';
  import streamsStore from '$lib/stores/streams/streams.store';
  import Supporters from '../supporters-section/supporters.section.svelte';

  export let address: string | undefined;
  export let collapsed = false;
  export let collapsable = false;
  export let showSupportersSection = false;

  let error = false;

  let dripLists: DripList[] | undefined;
  let representationalSplits: RepresentationalSplits | undefined;
  let incomingSplits: Awaited<ReturnType<typeof getIncomingSplits>> | undefined;

  $: ownerAccountId = dripLists && dripLists[0]?.account.owner.accountId;
  $: supportStreams =
    ownerAccountId &&
    $streamsStore &&
    streamsStore
      .getStreamsForUser(ownerAccountId)
      .outgoing.filter((s) => s.receiver.accountId === dripLists?.[0].account.accountId);

  async function updateDripLists() {
    try {
      const service = await DripListService.new();

      assert(address);
      dripLists = await service.getByOwnerAddress(address);

      // We only support a single Drip List right now. The user should have no way to create more than one.
      const canonicalDripList = dripLists[0];
      if (!canonicalDripList) {
        representationalSplits = [];
        incomingSplits = { users: [], projects: [], dripLists: [] };
        return;
      }

      const fetches = await Promise.all([
        getRepresentationalSplitsForAccount(
          canonicalDripList.account.accountId,
          canonicalDripList.projects,
        ),
        getIncomingSplits(canonicalDripList.account.accountId),
      ] as const);

      representationalSplits = fetches[0];
      incomingSplits = fetches[1];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      error = true;
    }
  }

  $: address && updateDripLists();

  $: isSelf = Boolean(address && address.toLowerCase() === $walletStore.address?.toLowerCase());
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: Ledger,
    label: 'Drip List',
    actionsDisabled: !dripLists || dripLists.length > 0,
    actions: isSelf
      ? [
          {
            label: 'Create Drip List',
            icon: Plus,
            variant: !dripLists || dripLists.length > 0 ? undefined : 'primary',
            handler: () => goto('/app/funder-onboarding'),
          },
        ]
      : [],
  }}
  skeleton={{
    loaded:
      error ||
      dripLists?.length === 0 ||
      (dripLists !== undefined &&
        incomingSplits !== undefined &&
        supportStreams !== undefined &&
        representationalSplits !== undefined),
    empty: dripLists && dripLists.length === 0,
    error,
    emptyStateEmoji: '🫗',
    emptyStateHeadline: isSelf ? 'You donʼt have a Drip List' : 'No Drip List',
    emptyStateText: isSelf
      ? 'Create your Drip List to start supporting your dependencies'
      : 'Drip Lists enable supporting a set of open-source projects.',
  }}
>
  {#if dripLists && supportStreams && representationalSplits && incomingSplits}
    <DripListCard
      {supportStreams}
      {incomingSplits}
      {representationalSplits}
      dripList={dripLists[0]}
    />
  {/if}
</Section>

{#if showSupportersSection && dripLists?.length}
  <Supporters
    type="dripList"
    headline="Support"
    {incomingSplits}
    infoTooltip="You can support your Drip List with one or more support streams. Others can also add your Drip List to their Drip Lists to support it."
    isDripListOwner={isSelf}
    supportStreams={supportStreams || []}
    dripListId={dripLists?.[0]?.account.accountId}
  />
{/if}
