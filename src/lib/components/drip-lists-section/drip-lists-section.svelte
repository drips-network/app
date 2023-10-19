<script lang="ts">
  import type { DripList } from '$lib/utils/metadata/types';
  import DripListService from '$lib/utils/driplist/DripListService';
  import assert from '$lib/utils/assert';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import { goto } from '$app/navigation';
  import DripListCard from '../drip-list-card/drip-list-card.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Section from '../section/section.svelte';
  import AddressDriverMetadataManager from '$lib/utils/metadata/AddressDriverMetadataManager';
  import { AddressDriverClient } from 'radicle-drips';
  import Button from '../button/button.svelte';
  import Illustration from '../icons/✏️.svelte';

  export let accountId: string | undefined;
  export let collapsed = false;
  export let collapsable = false;
  export let showCreateNewListCard = false;

  /** Set to true if the `visibleDripListAccountIds` setting from metadata should be ignored. */
  export let showHiddenDripLists = false;

  let error = false;

  let dripLists: DripList[] | undefined;
  async function updateDripLists() {
    try {
      const dripListService = await DripListService.new();

      assert(accountId);
      const address = AddressDriverClient.getUserAddress(accountId);
      dripLists = await dripListService.getByOwnerAddress(address);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      error = true;
    }
  }
  $: accountId && updateDripLists();

  /*
  In V2 of AddressDriver account metadata, users can specify a list Drip List account IDs that they want
  to have appear on their profile. We should generally only show any Drip Lists on the user's profile that
    However:
  
  - The user may have created their Drip List on an earlier version of the app, and not have this setting. In
    this case, we should display only Drip Lists that they created themselves
  - The user may have created a Drip List before publishing any metadata for their address driver account at all.
    In this case, we should also only display Drip Lists that they created themselves.
  
  The variable below stores the value of the setting in metadata, or `null` if there's no metadata or it doesn't
  include this key. Before it's loaded, it's `undefined`.
  After this, we reactively compute the actual Drip Lists that should be displayed considering the logic outlined
  above, based on `dripLists` and `visibleDripListAccountIdsSetting`.
  */

  let visibleDripListAccountIdsSetting: string[] | null | undefined = undefined;
  async function updateVisibleDripListAccountIds() {
    try {
      const addressDriverMetadataManager = new AddressDriverMetadataManager();

      assert(accountId);

      /*
      TODO: Having to fetch the entire account metadata here again is pretty dumb. Once drips-event-processor is in
      prod, we can get rid of the `streams` store, and just fetch the `account` on profiles. Then, we can simply pass
      `account.visibleDripListAccountIds` to this component as a prop.
      */
      const accountMetadata = await addressDriverMetadataManager.fetchAccountMetadata(accountId);

      if (!accountMetadata) {
        visibleDripListAccountIdsSetting = null;
      } else if ('visibleDripListAccountIds' in accountMetadata.data) {
        visibleDripListAccountIdsSetting = accountMetadata.data.visibleDripListAccountIds;
      } else {
        visibleDripListAccountIdsSetting = null;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      error = true;
    }
  }
  $: accountId && !showHiddenDripLists && updateVisibleDripListAccountIds();

  let visibleDripLists: DripList[] | undefined;
  $: {
    if (showHiddenDripLists) {
      // We should just show all Drip Lists.
      visibleDripLists = dripLists;
    } else if (dripLists !== undefined && visibleDripListAccountIdsSetting !== undefined) {
      // If the visibleDripList setting exists, display only those in the array, otherwise any created by the user themselves.
      if (visibleDripListAccountIdsSetting === null) {
        // TODO: Figure out which Drip Lists were created by someone else initially, and filter those out.
        visibleDripLists = dripLists;
      } else {
        visibleDripLists = dripLists.filter((d) => {
          assert(visibleDripListAccountIdsSetting);
          return visibleDripListAccountIdsSetting.includes(d.account.accountId);
        });
      }
    } else {
      visibleDripLists = undefined;
    }
  }

  $: isSelf = Boolean(accountId && accountId === $walletStore.dripsAccountId);
  $: isGridFormat = (visibleDripLists?.length ?? 0) > 1;
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: DripListIcon,
    label: 'Drip Lists',
    actionsDisabled: !dripLists,
    actions: isSelf
      ? [
          {
            label: 'Create Drip List',
            icon: Plus,
            variant: 'primary',
            handler: () => goto('/app/funder-onboarding'),
          },
        ]
      : [],
  }}
  skeleton={{
    loaded: error || dripLists !== undefined,
    empty: dripLists && dripLists.length === 0,
    error,
    emptyStateEmoji: '🫗',
    emptyStateHeadline: isSelf ? 'You donʼt have any Drip Lists' : 'No Drip Lists',
    emptyStateText: isSelf
      ? 'Create a Drip List to start supporting your dependencies'
      : 'Drip Lists enable supporting a set of open-source projects',
    horizontalScroll: false,
  }}
>
  {#if visibleDripLists}
    <div
      class="grid gap-6 grid-cols-1 padding pt-px {visibleDripLists.length > 0
        ? 'lg:grid-cols-2'
        : ''}"
    >
      {#each visibleDripLists as dripList}
        <DripListCard {dripList} format="thumblink" maxSplitsRows={4} />
      {/each}
      {#if showCreateNewListCard}
        <div
          class="shadow-low rounded-drip-lg flex items-center justify-center p-1"
          style:min-height="452px"
        >
          <div class="flex flex-col items-center gap-2 text-center">
            <Illustration size={48} />
            <h6 class="typo-text-bold">Got a new idea?</h6>
            <p>You can create as many Drip Lists as you like.</p>
            <div class="mt-2">
              <Button icon={Plus} on:click={() => goto('/app/funder-onboarding')}
                >Create a new Drip List</Button
              >
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</Section>
