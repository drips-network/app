<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const DRIP_LIST_CARD_THUMBLINK_FRAGMENT = gql`
    ${SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT}
    ${PROJECT_AVATAR_FRAGMENT}
    ${DRIP_LIST_CARD_SUPPORTER_PILE_FRAGMENT}
    fragment DripListCardThumblink on DripList {
      ...DripListCardSupporterPile
      name
      description
      account {
        accountId
      }
      owner {
        accountId
      }
      splits {
        ... on AddressReceiver {
          ...SplitsComponentAddressReceiver
        }
        ... on ProjectReceiver {
          ...SplitsComponentProjectReceiver
        }
        ... on DripListReceiver {
          ...SplitsComponentDripListReceiver
        }
      }
    }
  `;
</script>

<script lang="ts">
  import Drip from '../illustrations/drip.svelte';
  import Splits, {
    SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT,
    SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT,
    SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT,
    type SplitsComponentSplitsReceiver,
  } from '../splits/splits.svelte';
  import balancesStore from '$lib/stores/balances/balances.store';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import { constants } from 'radicle-drips';
  import { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
  import Pile from '../pile/pile.svelte';
  import { browser } from '$app/environment';
  import TextExpandable from '../text-expandable.svelte/text-expandable.svelte';
  import mergeAmounts from '$lib/utils/amounts/merge-amounts';
  import accountFetchStatusses from '$lib/stores/account-fetch-statusses/account-fetch-statusses.store';
  import getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';
  import type { DripListCardThumblinkFragment } from './__generated__/gql.generated';
  import getIncomingGivesTotal from '$lib/utils/gives/get-incoming-gives-total';
  import { onDestroy, onMount } from 'svelte';
  import streamsStore from '$lib/stores/streams/streams.store';
  import getSupportersPile, {
    DRIP_LIST_CARD_SUPPORTER_PILE_FRAGMENT,
  } from './methods/get-supporters-pile';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';
  import VotingRoundSplits from './components/voting-round-splits.svelte';
  import assert from '$lib/utils/assert';
  import StatusBadge from '../status-badge/status-badge.svelte';
  import Proposals from '../icons/Proposals.svelte';

  export let dripList: DripListCardThumblinkFragment | null = null;
  export let votingRound: (VotingRound & { splits?: SplitsComponentSplitsReceiver[] }) | null =
    null;

  assert(
    dripList || votingRound,
    'DripListCardThumblink requires either a dripList or a votingRound, or both',
  );

  $: listOwner = dripList?.owner;
  $: dripListUrl = dripList
    ? `/app/drip-lists/${dripList.account.accountId}`
    : votingRound
    ? `/app/drip-lists/${votingRound.id}`
    : undefined;

  $: description = dripList?.description || votingRound?.description;

  /*
    On mount, ensure the streams store has fetched the owner's account so that we can be sure that
    any support streams appear as expected.
    Then, select the support streams that are streaming to the list.
  */
  onMount(async () => {
    if (!listOwner) return;

    if (!$streamsStore.accounts[listOwner.accountId]) {
      await streamsStore.fetchAccount(listOwner.accountId);
    }
  });

  $: supportStreams =
    listOwner &&
    $streamsStore &&
    streamsStore
      .getStreamsForUser(listOwner.accountId)
      .outgoing.filter((s) => s.receiver.accountId === dripList?.account.accountId);

  let incomingSplitTotal: Awaited<ReturnType<typeof getIncomingSplitTotal>> | undefined = undefined;
  onMount(async () => {
    if (!dripList) return;
    incomingSplitTotal = await getIncomingSplitTotal(dripList.account.accountId);
  });

  let incomingGivesTotal: Awaited<ReturnType<typeof getIncomingGivesTotal>> | undefined = undefined;
  onMount(async () => {
    if (!dripList) return;
    incomingGivesTotal = await getIncomingGivesTotal(dripList.account.accountId);
  });

  $: streamEstimates =
    dripList &&
    $balancesStore &&
    balancesStore.getStreamEstimatesByReceiver('total', dripList.account.accountId).map((e) => ({
      amount: e.totalStreamed / BigInt(constants.AMT_PER_SEC_MULTIPLIER),
      tokenAddress: e.tokenAddress,
    }));

  /*
    Only the list owner can set support streams to the list, so we can consider the stream estimate to the list loaded when
    the owner account is loaded.
  */
  $: streamEstimateLoaded =
    dripList && $accountFetchStatusses[dripList.owner.accountId]?.all === 'fetched';

  let totalIncomingAmounts: ReturnType<typeof mergeAmounts> | undefined = undefined;
  $: totalIncomingAmounts =
    streamEstimates && incomingSplitTotal && streamEstimateLoaded && incomingGivesTotal
      ? mergeAmounts(streamEstimates, incomingSplitTotal, incomingGivesTotal)
      : undefined;

  $: supportersPile =
    dripList && supportStreams && getSupportersPile(supportStreams, dripList.support);

  /* Watch for voting ended */
  let now = new Date();
  $: votingEnded = votingRound ? now >= new Date(votingRound.schedule.voting.endsAt) : undefined;
  let counter: number;

  onMount(() => {
    if (votingRound && votingEnded === false) {
      (function count() {
        counter = window.setTimeout(() => {
          now = new Date();
          return !votingEnded && count();
        }, 1000);
      })();
    }
  });
  onDestroy(() => clearTimeout(counter));
</script>

<a
  class:has-description={description}
  href={dripListUrl}
  class="drip-list-card rounded-drip-lg overflow-hidden shadow-low group"
>
  <div class="flex flex-col gap-6 pointer-events-noneff">
    <header class="px-6 pt-6 flex flex-col gap-2">
      <div class="flex items-center justify-between gap-4">
        <h6 class="title typo-header-1 truncate" style="line-height:1">
          {dripList?.name || votingRound?.name}
        </h6>
        {#if votingRound}
          <StatusBadge icon={Proposals} size="small" color={votingEnded ? 'foreground' : 'primary'}>
            {votingEnded ? 'Voting ended' : 'In voting'}
          </StatusBadge>
        {/if}
      </div>
      {#if (description ?? '').length > 0}
        <div class="description">
          <TextExpandable isExpandable={false}>
            {description}
          </TextExpandable>
        </div>
      {/if}
      {#if supportersPile && supportersPile.length > 0}
        <div class="flex gap-2">
          Supported by <Pile maxItems={3} components={supportersPile ?? []} itemsClickable={true} />
        </div>
      {/if}
    </header>

    <div class="list">
      {#if dripList || votingRound?.result}
        <div class="totals">
          <div class="drip-icon flex-shrink-0">
            <Drip fill={dripList ? 'var(--color-primary)' : 'var(--color-foreground-level-5)'} />
          </div>
          {#if dripList && browser}
            <div class="typo-text tabular-nums total-streamed-badge">
              <AggregateFiatEstimate supressUnknownAmountsWarning amounts={totalIncomingAmounts} />
              <span class="muted">&nbsp;total</span>
            </div>
          {/if}
        </div>
      {/if}
      <div class="splits-component">
        {#if dripList}
          <Splits
            groupsExpandable={false}
            list={dripList.splits}
            maxRows={dripList.description ? 3 : 4}
          />
        {:else if votingRound}
          <VotingRoundSplits {votingRound} maxRows={votingRound.description ? 3 : 4} />
        {/if}
      </div>
    </div>
  </div>
  <div class="overflow-gradient" />
</a>

<style>
  .drip-list-card {
    box-shadow: var(--elevation-low);
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
  }

  .drip-list-card:hover {
    box-shadow: var(--elevation-medium);
    transform: translateY(-0.125rem);
  }

  .totals {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
  }

  .overflow-gradient {
    position: absolute;
    z-index: 1;
    width: 2rem;
    top: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to right, transparent, var(--color-background) 75%);
  }

  .totals .drip-icon {
    width: 1.5rem;
  }

  .totals .total-streamed-badge {
    background-color: var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
  }

  .list {
    padding: 0 1.5rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .list:not(:last-child) {
    padding-bottom: 0;
  }

  .splits-component {
    margin-left: 10px;
    pointer-events: none;
  }

  .muted {
    color: var(--color-foreground-level-5);
  }
</style>
