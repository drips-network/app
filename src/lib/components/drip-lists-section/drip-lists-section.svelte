<script lang="ts">
  import type { DripList } from '$lib/utils/metadata/types';
  import type { Splits as RepresentationalSplits } from '$lib/components/splits/splits.svelte';
  import { onMount } from 'svelte';
  import DripListService from '$lib/utils/driplist/DripListService';
  import assert from '$lib/utils/assert';
  import { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';
  import SectionHeader from '../section-header/section-header.svelte';
  import SectionSkeleton from '../section-skeleton/section-skeleton.svelte';
  import Ledger from 'radicle-design-system/icons/Ledger.svelte';
  import { goto } from '$app/navigation';
  import DripListCard from '../drip-list-card/drip-list-card.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';

  export let address: string;

  let error = false;

  let dripLists: DripList[] | undefined;
  let representationalSplits: RepresentationalSplits | undefined;
  onMount(async () => {
    try {
      const service = await DripListService.new();

      assert(address);
      dripLists = await service.getByOwnerAddress(address);

      // We only support a single Drip List right now. The user should have no way to create more than one.
      const canonicalDripList = dripLists[0];
      if (!canonicalDripList) return;

      representationalSplits = await getRepresentationalSplitsForAccount(
        canonicalDripList.account.userId,
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      error = true;
    }
  });

  $: isSelf = address.toLowerCase() === $walletStore.address?.toLowerCase();
</script>

<div class="section">
  <SectionHeader
    icon={Ledger}
    label="Drip List"
    actionsDisabled={!dripLists || dripLists.length > 0}
    actions={isSelf
      ? [
          {
            label: 'Create Drip List',
            icon: Plus,
            variant: 'primary',
            handler: () => goto('/app/funder-onboarding'),
          },
        ]
      : []}
  />
  <SectionSkeleton
    loaded={error ||
      dripLists?.length === 0 ||
      (dripLists !== undefined && representationalSplits !== undefined)}
    empty={dripLists && dripLists.length === 0}
    {error}
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
