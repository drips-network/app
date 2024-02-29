<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const DRIP_LIST_CARD_FRAGMENT = gql`
    ${EDIT_DRIP_LIST_STEP_SELECTED_DRIP_LIST_FRAGMENT}
    ${SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT}
    ${PROJECT_AVATAR_FRAGMENT}
    ${DRIP_LIST_CARD_SUPPORTER_PILE_FRAGMENT}
    fragment DripListCard on DripList {
      ...EditDripListStepSelectedDripList
      ...DripListCardSupporterPile
      name
      account {
        accountId
      }
      owner {
        accountId
        address
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
  import Pen from '$lib/components/icons/Pen.svelte';
  import Button from '../button/button.svelte';
  import Drip from '../illustrations/drip.svelte';
  import Splits, {
    SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT,
    SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT,
    SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT,
  } from '../splits/splits.svelte';
  import checkIsUser from '$lib/utils/check-is-user';
  import balancesStore from '$lib/stores/balances/balances.store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import modal from '$lib/stores/modal';
  import Stepper from '../stepper/stepper.svelte';
  import editDripListSteps from '$lib/flows/edit-drip-list/edit-members/edit-drip-list-steps';
  import ShareButton from '../share-button/share-button.svelte';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import { constants } from 'radicle-drips';
  import { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
  import Pile from '../pile/pile.svelte';
  import { browser } from '$app/environment';
  import TextExpandable from '../text-expandable.svelte/text-expandable.svelte';
  import mergeAmounts from '$lib/utils/amounts/merge-amounts';
  import accountFetchStatusses from '$lib/stores/account-fetch-statusses/account-fetch-statusses.store';
  import getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';
  import type { DripListCardFragment } from './__generated__/gql.generated';
  import { EDIT_DRIP_LIST_STEP_SELECTED_DRIP_LIST_FRAGMENT } from '$lib/flows/edit-drip-list/shared/steps/edit-drip-list.svelte';
  import getIncomingGivesTotal from '$lib/utils/gives/get-incoming-gives-total';
  import { onMount } from 'svelte';
  import streamsStore from '$lib/stores/streams/streams.store';
  import getSupportersPile, {
    DRIP_LIST_CARD_SUPPORTER_PILE_FRAGMENT,
  } from './methods/get-supporters-pile';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import TabbedBox from '../tabbed-box/tabbed-box.svelte';
  import TransitionedHeight from '../transitioned-height/transitioned-height.svelte';
  import { fade } from 'svelte/transition';

  export let dripList: DripListCardFragment;

  $: listOwner = dripList.owner;
  $: dripListUrl = `/app/drip-lists/${dripList.account.accountId}`;
  $: isOwnList = $walletStore && checkIsUser(dripList.owner.accountId);

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

  $: supportStreams =
    listOwner &&
    $streamsStore &&
    streamsStore
      .getStreamsForUser(listOwner.accountId)
      .outgoing.filter((s) => s.receiver.accountId === dripList.account.accountId);

  let incomingSplitTotal: Awaited<ReturnType<typeof getIncomingSplitTotal>> | undefined = undefined;
  onMount(async () => {
    incomingSplitTotal = await getIncomingSplitTotal(dripList.account.accountId);
  });

  let incomingGivesTotal: Awaited<ReturnType<typeof getIncomingGivesTotal>> | undefined = undefined;
  onMount(async () => {
    incomingGivesTotal = await getIncomingGivesTotal(dripList.account.accountId);
  });

  $: streamEstimates =
    $balancesStore &&
    balancesStore.getStreamEstimatesByReceiver('total', dripList.account.accountId).map((e) => ({
      amount: e.totalStreamed / BigInt(constants.AMT_PER_SEC_MULTIPLIER),
      tokenAddress: e.tokenAddress,
    }));

  /*
    Only the list owner can set support streams to the list, so we can consider the stream estimate to the list loaded when
    the owner account is loaded.
  */
  $: streamEstimateLoaded = $accountFetchStatusses[dripList.owner.accountId]?.all === 'fetched';

  let totalIncomingAmounts: ReturnType<typeof mergeAmounts> | undefined = undefined;
  $: totalIncomingAmounts =
    incomingSplitTotal && streamEstimateLoaded && incomingGivesTotal
      ? mergeAmounts(streamEstimates, incomingSplitTotal, incomingGivesTotal)
      : undefined;

  $: supportersPile = getSupportersPile(supportStreams, dripList.support);

  function triggerEditModal() {
    modal.show(Stepper, undefined, editDripListSteps(dripList));
  }

  // TODO: Needs to be real based on whether a list is in voting or not
  export let inVoting = true;

  let activeTab = 'tab-1';
</script>

<section
  class:has-description={dripList.description}
  class="drip-list-card rounded-drip-lg overflow-hidden shadow-low group"
>
  <div class="flex flex-col gap-8">
    <header class="px-6 pt-6 flex flex-col gap-4 lg:gap-5">
      <div class="title-and-actions">
        <h1 class="title">
          <a
            href={dripListUrl}
            class="focus-visible:outline-none focus-visible:bg-primary-level-1 rounded"
          >
            {dripList.name}
          </a>
        </h1>
        <div class="flex items-center gap-4 -my-1">
          <ShareButton url="https://drips.network/app/drip-lists/{dripList.account.accountId}" />
          {#if isOwnList}
            <Button on:click={triggerEditModal} icon={Pen}>Edit list</Button>
          {/if}
        </div>
      </div>
      {#if (dripList.description ?? '').length > 0}
        <div class="description">
          <TextExpandable isExpandable={true}>
            {dripList.description}
          </TextExpandable>
        </div>
      {/if}
      <div class="flex gap-2">
        Created by <IdentityBadge
          showAvatar={true}
          showIdentity={true}
          address={listOwner.address}
        />
      </div>
    </header>

    <section>
      {#if inVoting}
        <div class="-mt-4 mb-10 sm:-mt-6 sm:mb-8">
          <TabbedBox
            bind:activeTab
            tabs={{
              1: 'Current',
              2: 'In voting',
            }}
            ariaLabel="Toggle list versions"
          />
        </div>
      {/if}

      <TransitionedHeight transitionHeightChanges>
        <div class="tabs">
          <div class="list tab tab-1" class:active-tab={activeTab === 'tab-1'}>
            <div class="totals">
              <div class="drip-icon flex-shrink-0">
                <Drip />
              </div>
              <div class="typo-text tabular-nums total-streamed-badge">
                {#if browser}
                  <AggregateFiatEstimate
                    supressUnknownAmountsWarning
                    amounts={totalIncomingAmounts}
                  />
                {/if}
                <span class="muted">&nbsp;total</span>
              </div>
              {#if supportersPile && supportersPile.length > 0}
                <div in:fade|local={{ duration: 300 }} class="flex items-center gap-1.5 min-w-0">
                  <span class="typo-text-small truncate muted">Supported by</span>
                  <Pile maxItems={3} components={supportersPile ?? []} itemsClickable={true} />
                </div>
              {/if}
            </div>
            <div class="splits-component">
              <Splits groupsExpandable={true} list={dripList.splits} />
            </div>
          </div>

          <div class="list tab tab-2" class:active-tab={activeTab === 'tab-2'}>
            voting drip list goes here
          </div>
        </div>
      </TransitionedHeight>
    </section>
  </div>
</section>

<style>
  .drip-list-card {
    box-shadow: var(--elevation-low);
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
  }

  .drip-list-card .title-and-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .drip-list-card .title-and-actions {
    flex-wrap: wrap;
  }

  .drip-list-card .title-and-actions h1 {
    min-width: fit-content;
  }

  .totals {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
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
    gap: 1rem;
  }

  .splits-component {
    margin-left: 10px;
  }

  .muted {
    color: var(--color-foreground-level-5);
  }

  .tabs {
    position: relative;
  }

  .tab {
    position: absolute;
    top: 0;
    transition: opacity 0.3s, transform 0.3s;
    opacity: 0;
    pointer-events: none;
  }

  .tab-1 {
    transform: translateX(-4rem);
  }

  .tab-2 {
    transform: translateX(4rem);
  }

  .tab.active-tab {
    position: relative;
    transform: none;
    opacity: 1;
    pointer-events: auto;
  }
</style>
