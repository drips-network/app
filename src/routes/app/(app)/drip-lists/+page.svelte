<script lang="ts">
  import walletStore from '$lib/stores/wallet/wallet.store';
  import DripListService from '$lib/utils/driplist/DripListService';
  import guardConnected from '$lib/utils/guard-connected';
  import type { DripList } from '$lib/utils/metadata/types';
  import { onMount } from 'svelte';
  import assert from '$lib/utils/assert';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Ledger from 'radicle-design-system/icons/Ledger.svelte';
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import type { Splits as RepresentationalSplits } from '$lib/components/splits/splits.svelte';
  import { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';
  import { goto } from '$app/navigation';

  $: {
    $walletStore.connected;
    guardConnected();
  }

  let dripLists: DripList[] | undefined;
  let representationalSplits: RepresentationalSplits | undefined;
  onMount(async () => {
    const service = await DripListService.new();
    const { address } = $walletStore;

    assert(address);
    dripLists = await service.getByOwnerAddress(address);

    // We only support a single Drip List right now. The user should have no way to create more than one.
    const canonicalDripList = dripLists[0];
    if (!canonicalDripList) return;

    /*
    We currently fetch all projects on the list twice for no reason, once in DripListService, and here below to get
    representational splits.

    TODO: Don't do that.
    */
    representationalSplits = await getRepresentationalSplitsForAccount(
      canonicalDripList.account.userId,
    );
  });
</script>

<svelte:head>
  <title>Drip Lists | Drips</title>
  <meta name="description" content="Drip Lists Page" />
</svelte:head>

<div class="section">
  <SectionHeader
    icon={Ledger}
    label="Your Drip List"
    actionsDisabled={!dripLists || dripLists.length > 0}
    actions={[
      {
        label: 'Create Drip List',
        icon: Plus,
        variant: 'primary',
        handler: () => goto('/app/funder-onboarding'),
      },
    ]}
  />
  <SectionSkeleton
    loaded={dripLists?.length === 0 ||
      (dripLists !== undefined && representationalSplits !== undefined)}
    empty={dripLists && dripLists.length === 0}
    emptyStateEmoji="🫗"
    emptyStateHeadline="You don't have a Drip List"
    emptyStateText="Create your Drip List to start supporting your dependencies"
  >
    {#if dripLists && representationalSplits}
      <DripListCard {representationalSplits} dripList={dripLists[0]} />
    {/if}
  </SectionSkeleton>
</div>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
