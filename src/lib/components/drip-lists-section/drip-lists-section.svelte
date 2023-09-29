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

  export let accountId: string | undefined;
  export let collapsed = false;
  export let collapsable = false;

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
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: DripListIcon,
    label: 'Drip List',
    actionsDisabled: !dripLists || dripLists.length > 0,
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
  }}
>
  {#if visibleDripLists}
    {#each visibleDripLists as dripList}
      <DripListCard {dripList} />
    {/each}
  {/if}
</Section>
