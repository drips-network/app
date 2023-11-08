<script lang="ts">
  import assert from '$lib/utils/assert';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import { goto } from '$app/navigation';
  import DripListCard, { DRIP_LIST_CARD_FRAGMENT } from '../drip-list-card/drip-list-card.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Section from '../section/section.svelte';
  import { AddressDriverClient } from 'radicle-drips';
  import Button from '../button/button.svelte';
  import Illustration from '../icons/✏️.svelte';
  import { gql } from 'graphql-request';
  import type { DripListsQuery, DripListsQueryVariables } from './__generated__/gql.generated';
  import query from '$lib/graphql/dripsQL';

  export let accountId: string | undefined;
  export let collapsed = false;
  export let collapsable = false;
  export let showCreateNewListCard = false;

  let error = false;

  let dripLists: DripListsQuery['dripLists'] | undefined;
  async function updateDripLists() {
    try {
      assert(accountId);
      const address = AddressDriverClient.getUserAddress(accountId);

      const dripListsQuery = gql`
        ${DRIP_LIST_CARD_FRAGMENT}
        query DripLists($where: DripListWhereInput) {  
          dripLists(where: $where) {
            ...DripListCard
          }
        }
      `;
      
      const result = await query<DripListsQuery, DripListsQueryVariables>(dripListsQuery, {
        where: {
          ownerAddress: address,
        },
      });

      dripLists = result.dripLists;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      error = true;
    }
  }
  $: accountId && updateDripLists();

  $: isSelf = Boolean(accountId && accountId === $walletStore.dripsAccountId);
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
    empty: (dripLists && dripLists.length === 0) ?? undefined,
    error,
    emptyStateEmoji: '🫗',
    emptyStateHeadline: isSelf ? 'You donʼt have any Drip Lists' : 'No Drip Lists',
    emptyStateText: isSelf
      ? 'Create a Drip List to start supporting your dependencies'
      : 'Drip Lists enable supporting a set of open-source projects',
    horizontalScroll: false,
  }}
>
  {#if dripLists}
    <div
      class="grid gap-6 grid-cols-1 padding pt-px {dripLists.length > 0 ? 'lg:grid-cols-2' : ''}"
    >
      {#each dripLists as dripList}
        <DripListCard {dripList} format="thumblink" />
      {/each}
      {#if showCreateNewListCard}
        <div
          class="shadow-low rounded-drip-lg flex items-center justify-center p-1"
          style:min-height="398px"
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
