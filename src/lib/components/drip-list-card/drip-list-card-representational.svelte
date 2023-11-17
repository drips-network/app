<script lang="ts" context="module">
  import { gql } from "graphql-request";

  export const DRIP_LIST_CARD_REPRESENTATIONAL_LIST_FRAGMENT = gql`
    ${EDIT_DRIP_LIST_STEP_SELECTED_DRIP_LIST_FRAGMENT}
    ${SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT}
    ${SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT}
    fragment DripListCardRepresentationalList on DripList {
      ...EditDripListStepSelectedDripList
      name
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

  export const DRIP_LIST_CARD_REPRESENTATIONAL_PROJECT_SUPPORTER_FRAGMENT = gql`
    fragment DripListCardRepresentationalProjectSupporter on Project {
      ... on ClaimedProject {
        account {
          accountId
        }
        owner {
          address
        }
      }
    }
  `;
</script>
  
<script lang="ts">
  import Pen from 'radicle-design-system/icons/Pen.svelte';
  import Button from '../button/button.svelte';
  import Drip from '../illustrations/drip.svelte';
  import Splits, { SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT, SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT, SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT } from '../splits/splits.svelte';
  import checkIsUser from '$lib/utils/check-is-user';
  import balancesStore from '$lib/stores/balances/balances.store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import modal from '$lib/stores/modal';
  import Stepper from '../stepper/stepper.svelte';
  import editDripListSteps from '$lib/flows/edit-drip-list/edit-members/edit-drip-list-steps';
  import ShareButton from '../share-button/share-button.svelte';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import { constants } from 'radicle-drips';
  import type getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import ProjectAvatar from '../project-avatar/project-avatar.svelte';
  import Pile from '../pile/pile.svelte';
  import { fade } from 'svelte/transition';
  import { browser } from '$app/environment';
  import TextExpandable from '../text-expandable.svelte/text-expandable.svelte';
  import mergeAmounts from '$lib/utils/amounts/merge-amounts';
  import accountFetchStatusses from '$lib/stores/account-fetch-statusses/account-fetch-statusses.store';
  import type { Stream } from '$lib/stores/streams/types';
  import type getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';
  import ChevronRight from 'radicle-design-system/icons/ChevronRight.svelte';
  import type { DripListCardRepresentationalListFragment } from "./__generated__/gql.generated";
  import { EDIT_DRIP_LIST_STEP_SELECTED_DRIP_LIST_FRAGMENT } from "$lib/flows/edit-drip-list/shared/steps/edit-drip-list.svelte";

  export let dripList: DripListCardRepresentationalListFragment;
  export let format: 'thumblink' | 'full' = 'full';

  $: dripListUrl = `/app/drip-lists/${dripList.account.accountId}`;
  $: isOwnList = $walletStore && checkIsUser(dripList.owner.accountId);

  export let incomingSplits: Awaited<ReturnType<typeof getIncomingSplits>> | undefined;
  export let supportStreams: Stream[];

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
  $: streamEstimateLoaded =
    $accountFetchStatusses[dripList.owner.accountId]?.all === 'fetched';

  export let incomingSplitTotal: Awaited<ReturnType<typeof getIncomingSplitTotal>> | undefined;

  let totalIncomingAmounts: ReturnType<typeof mergeAmounts> | undefined = undefined;
  $: totalIncomingAmounts =
    incomingSplitTotal && streamEstimateLoaded
      ? mergeAmounts(streamEstimates, incomingSplitTotal)
      : undefined;

  function getSupportersPile(streams: typeof supportStreams, splits: typeof incomingSplits) {
    if (!supportStreams || !splits) return undefined;

    const result = [];

    result.push(
      splits.users.map((s) => ({
        component: IdentityBadge,
        props: {
          address: s.value.address,
          showIdentity: false,
          outline: true,
          size: 'normal',
          disableTooltip: true,
        },
      })),
    );

    result.push(
      splits.projects.map((s) => ({
        component: ProjectAvatar,
        props: {
          project: s.value,
          outline: true,
          size: 'tiny',
        },
      })),
    );

    result.push(
      splits.dripLists.map((s) => ({
        component: IdentityBadge,
        props: {
          address: s.value.owner.address,
          showIdentity: false,
          outline: true,
          size: 'normal',
          disableTooltip: true,
        },
      })),
    );

    // If the owner is streaming to the list, we only want to show them once in the pile.
    if (streams.length > 0) {
      result.push({
        component: IdentityBadge,
        props: {
          address: streams[0].sender.address,
          showIdentity: false,
          outline: true,
          size: 'normal',
          disableTooltip: true,
        },
      });
    }

    return result.flat();
  }
  $: supportersPile = getSupportersPile(supportStreams, incomingSplits);

  function triggerEditModal() {
    modal.show(Stepper, undefined, editDripListSteps(dripList));
  }

  let maxRows: number | undefined;
  $: {
    if (format === 'full') {
      maxRows = undefined;
    } else {
      maxRows = dripList.description ? 3 : 4;
    }
  }
</script>

<svelte:element
  this={format === 'thumblink' ? 'a' : 'section'}
  class:has-description={dripList.description}
  href={format === 'thumblink' ? dripListUrl : undefined}
  class="drip-list-card {format} rounded-drip-lg overflow-hidden shadow-low group"
>
  <div
    class="flex flex-col gap-{dripList.description ? '4' : '6'}"
    class:pointer-events-none={format === 'thumblink'}
  >
    <header class="px-6 pt-6 flex flex-col gap-2">
      <div class="title-and-actions">
        <h1 class="title" class:truncate={format === 'thumblink'}>
          <a
            href={dripListUrl}
            class="focus-visible:outline-none focus-visible:bg-primary-level-1 rounded"
          >
            {dripList.name}
          </a>
        </h1>
        {#if format === 'thumblink'}
          <ChevronRight />
        {:else}
          <div class="flex items-center gap-4">
            <ShareButton url="https://drips.network/app/drip-lists/{dripList.account.accountId}" />
            {#if isOwnList}
              <Button on:click={triggerEditModal} icon={Pen}>Edit list</Button>
            {/if}
          </div>
        {/if}
      </div>
      {#if (dripList.description ?? '').length > 0}
        <div class="description">
          <TextExpandable isExpandable={format === 'full'}>
            {dripList.description}
          </TextExpandable>
        </div>
      {/if}
    </header>

    <div class="list">
      <div class="totals">
        <div class="drip-icon flex-shrink-0">
          <Drip />
        </div>
        <div class="typo-text tabular-nums total-streamed-badge">
          {#if browser}
            <AggregateFiatEstimate amounts={totalIncomingAmounts} />
          {/if}
          <span class="muted">&nbsp;total</span>
        </div>
        {#if supportersPile && supportersPile.length > 0}
          <div in:fade|local={{ duration: 300 }} class="supporters min-w-0">
            <span class="typo-text-small truncate muted">Supported by</span>
            <Pile maxItems={3} components={supportersPile ?? []} itemsClickable={true} />
          </div>
        {/if}
      </div>
        <div class="splits-component">
          <Splits groupsExpandable={format === 'full'} list={dripList.splits} {maxRows} />
        </div>
    </div>
  </div>
  <div class="overflow-gradient" />
</svelte:element>

<style>
  .drip-list-card {
    box-shadow: var(--elevation-low);
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
  }

  .drip-list-card.thumblink:hover {
    box-shadow: var(--elevation-medium);
    transform: translateY(-0.125rem);
  }

  .drip-list-card .title-and-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .drip-list-card.full .title-and-actions {
    flex-wrap: wrap;
  }

  .drip-list-card.full .title-and-actions h1 {
    min-width: fit-content;
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
    gap: 1rem;
  }

  .list:not(:last-child) {
    padding-bottom: 0;
  }

  .splits-component {
    margin-left: 10px;
  }

  .supporters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .muted {
    color: var(--color-foreground-level-5);
  }
</style>
