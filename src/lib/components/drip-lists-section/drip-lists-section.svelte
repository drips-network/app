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
  import modal from '$lib/stores/modal';
  import CreateDripListStepper from '$lib/flows/create-drip-list-flow/create-drip-list-stepper.svelte';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';
  import DripListCard from '../drip-list-card/drip-list-card.svelte';
  import type { DripListsSectionDripListFragment } from './__generated__/gql.generated';
  import type { SplitsComponentSplitsReceiver } from '../splits/types';

  export let dripLists: DripListsSectionDripListFragment[];
  export let votingRounds: (VotingRound & { splits: SplitsComponentSplitsReceiver[] })[];
  export let withCreateButton = false;

  export let collapsed = false;
  export let collapsable = false;
  export let showCreateNewListCard = false;

  let error = false;

  $: dripListsAndVotingRounds = [
    ...(dripLists?.map((dl) => ({ ...dl, type: 'drip-list' as const })) ?? []),
    ...(votingRounds?.map((dl) => ({ ...dl, type: 'voting-round' as const })) ?? []),
  ];
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: DripListIcon,
    label: 'Drip Lists',
    actionsDisabled: !dripLists,
    actions: withCreateButton
      ? [
          {
            label: 'Create Drip List',
            icon: Plus,
            handler: () =>
              modal.show(CreateDripListStepper, undefined, {
                skipWalletConnect: true,
                isModal: true,
              }),
          },
        ]
      : [],
  }}
  skeleton={{
    loaded: error || dripLists !== undefined,
    empty: dripListsAndVotingRounds.length === 0,
    error,
    emptyStateEmoji: '🫗',
    emptyStateHeadline: 'No Drip Lists',
    emptyStateText: withCreateButton
      ? 'Create a Drip List to start supporting your dependencies'
      : 'Drip Lists enable supporting a set of open-source projects',
    horizontalScroll: false,
  }}
>
  {#if dripListsAndVotingRounds}
    <div
      class="grid gap-6 grid-cols-1 padding pt-px {dripListsAndVotingRounds.length > 0
        ? 'lg:grid-cols-2'
        : ''}"
    >
      {#each dripListsAndVotingRounds as list}
        {@const matchingVotingRound =
          list.type === 'drip-list'
            ? votingRounds.find((vr) => vr.dripListId === list.account.accountId)
            : undefined}
        {#if list.type === 'drip-list' && matchingVotingRound}
          <DripListCard listingMode data={{ dripList: list, votingRound: matchingVotingRound }} />
        {:else if list.type === 'drip-list'}
          <DripListCard listingMode data={{ dripList: list }} />
        {:else if list.type === 'voting-round' && !dripLists.find((dl) => dl.account.accountId === list.dripListId)}
          <DripListCard listingMode data={{ votingRound: list }} />
        {/if}
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
              <Button
                icon={Plus}
                on:click={() =>
                  modal.show(CreateDripListStepper, undefined, {
                    skipWalletConnect: true,
                    isModal: true,
                  })}>Create a new Drip List</Button
              >
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</Section>
