<script lang="ts" context="module">
  import { gql } from 'graphql-request';
  import { DRIP_LIST_CARD_FRAGMENT } from '../drip-list-card/drip-list-card.svelte';

  export const DRIP_LISTS_SECTION_DRIP_LIST_FRAGMENT = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    fragment DripListsSectionDripList on DripList {
      ...DripListCard
    }
  `;
</script>

<script lang="ts">
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Section from '../section/section.svelte';
  import Button from '../button/button.svelte';
  import Illustration from '../icons/✏️.svelte';
  import DripListCard from '../drip-list-card/drip-list-card.svelte';
  import type { DripListsSectionDripListFragment } from './__generated__/gql.generated';
  import VisibilityToggle from '../visibility-toggle/visibility-toggle.svelte';
  import checkIsUser from '$lib/utils/check-is-user';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import launchCreateDripList from '../../utils/launch-create-drip-list';
  import network from '$lib/stores/wallet/network';

  export let dripLists: DripListsSectionDripListFragment[];
  export let withCreateButton = false;
  export let label = 'Your Drip Lists';

  export let collapsed = false;
  export let collapsable = false;
  export let showCreateNewListCard = false;
  export let showVisibilityToggle = false;

  let error = false;

  let showHidden: boolean = false;
  $: hiddenListsCount = dripLists.filter((dl) => !dl.isVisible).length ?? 0;

  $: visibleDripLists = dripLists.filter((dl) => dl.isVisible);

  $: hiddenDripLists = showHidden ? dripLists.filter((dl) => !dl.isVisible) : [];

  $: isOwner = $walletStore.connected && checkIsUser(dripLists[0]?.owner?.accountId);
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: DripListIcon,
    label,
    actionsDisabled: !dripLists,
    actions:
      withCreateButton && !network.readOnlyMode
        ? [
            {
              label: 'Create Drip List',
              icon: Plus,
              handler: launchCreateDripList,
            },
          ]
        : [],
  }}
  skeleton={{
    loaded: error || dripLists !== undefined,
    empty: showVisibilityToggle ? dripLists.length === 0 : visibleDripLists.length === 0,
    error,
    emptyStateEmoji: '🫗',
    emptyStateHeadline: 'No Drip Lists',
    emptyStateText: withCreateButton
      ? 'Create a Drip List to start supporting your dependencies'
      : 'Drip Lists enable supporting a set of open-source projects',
    horizontalScroll: false,
    disconnected: !$walletStore.connected,
    disconnectedStateEmoji: '🫙',
    disconnectedStateHeadline: 'Connect your wallet',
    disconnectedStateText: 'Your Drip Lists will show up here when your wallet is connected.',
  }}
>
  {#if visibleDripLists}
    <div
      class="grid gap-6 grid-cols-1 padding pt-px {visibleDripLists.length > 0
        ? 'lg:grid-cols-2'
        : ''}"
    >
      {#each visibleDripLists as list, index (index)}
        <DripListCard isHidden={!list.isVisible} variant="partial" data={{ dripList: list }} />
      {/each}
      {#if showCreateNewListCard && !network.readOnlyMode}
        <div
          class="shadow-low rounded-drip-lg flex items-center justify-center p-1"
          style:min-height="398px"
        >
          <div class="flex flex-col items-center gap-2 text-center">
            <Illustration size={48} />
            <h6 class="typo-text-bold">Got a new idea?</h6>
            <p>You can create as many Drip Lists as you like.</p>
            <div class="mt-2">
              <Button icon={Plus} onclick={launchCreateDripList}>Create a new Drip List</Button>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div>
      {#if isOwner && showVisibilityToggle}
        <VisibilityToggle bind:showHidden hiddenItemsCount={hiddenListsCount} />
      {/if}
    </div>

    <div
      class="grid gap-6 grid-cols-1 padding pt-px {hiddenDripLists.length > 0
        ? 'lg:grid-cols-2'
        : ''}"
    >
      {#each hiddenDripLists as list, index (index)}
        <DripListCard isHidden={!list.isVisible} variant="partial" data={{ dripList: list }} />
      {/each}
    </div>
  {/if}
</Section>
