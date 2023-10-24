<script lang="ts">
  import Pen from 'radicle-design-system/icons/Pen.svelte';
  import Button from '../button/button.svelte';
  import Drip from '../illustrations/drip.svelte';
  import Splits from '../splits/splits.svelte';
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
  import type { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';
  import type { Stream } from '$lib/stores/streams/types';
  import type getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';
  import type { DripList } from '$lib/utils/metadata/types';
  import ChevronRight from 'radicle-design-system/icons/ChevronRight.svelte';
  import TransitionedHeight from '../transitioned-height/transitioned-height.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import OverflowButton from '../overflow-button/overflow-button.svelte';
  import User from 'radicle-design-system/icons/User.svelte';

  export let dripList: DripList;
  export let format: 'thumblink' | 'full' = 'full';

  $: dripListUrl = `/app/drip-lists/${dripList.account.accountId}`;
  $: isOwnList = $walletStore && checkIsUser(dripList.account.owner.accountId);

  export let representationalSplits:
    | Awaited<ReturnType<typeof getRepresentationalSplitsForAccount>>
    | undefined;

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
    $accountFetchStatusses[dripList.account.owner.accountId]?.all === 'fetched';

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
          address: s.value.account.owner.address,
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
    if (!representationalSplits) return;

    modal.show(Stepper, undefined, editDripListSteps(dripList, representationalSplits));
  }

  let maxRows: number | undefined;
  $: {
    if (format === 'full') {
      maxRows = undefined;
    } else {
      maxRows = dripList.description ? 3 : 4;
    }
  }

  function getLoadingPlaceholderHeight() {
    const BASE_HEIGHT = 16;
    const ONE_SPLIT_HEIGHT = 49;

    const amountOfMembers = dripList.projects.length;

    if (format === 'full') {
      return BASE_HEIGHT + ONE_SPLIT_HEIGHT * amountOfMembers;
    } else {
      return dripList.description
        ? BASE_HEIGHT + ONE_SPLIT_HEIGHT * Math.min(3, amountOfMembers)
        : BASE_HEIGHT + ONE_SPLIT_HEIGHT * Math.min(4, amountOfMembers);
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
      <div
        class="flex gap-4 {format === 'full'
          ? 'flex-col sm:flex-row justify-left sm:justify-between sm:items-center'
          : 'items-center justify-between'}"
      >
        <h1 class="flex-1 min-w-0 text-left" class:truncate={format === 'thumblink'}>
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
              <OverflowButton
                options={[
                  {
                    type: 'action',
                    handler: triggerEditModal,
                    label: 'Edit list',
                    icon: Pen,
                  },
                  {
                    type: 'action',
                    handler: triggerEditModal,
                    label: 'Do something else',
                    icon: User,
                  },
                ]}
              />
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
      <TransitionedHeight transitionHeightChanges={true}>
        {#if representationalSplits}
          <div in:fade class="splits-component">
            <Splits groupsExpandable={format === 'full'} list={representationalSplits} {maxRows} />
          </div>
        {:else}
          <div class="loading-state" style:height="{getLoadingPlaceholderHeight()}px">
            <Spinner />
          </div>
        {/if}
      </TransitionedHeight>
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

  .drip-list-card .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .thumblink .description {
    height: 3rem;
  }

  .muted {
    color: var(--color-foreground-level-5);
  }
</style>
