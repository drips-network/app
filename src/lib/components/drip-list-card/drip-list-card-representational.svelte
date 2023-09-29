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
  import editDripListSteps from '$lib/flows/edit-drip-list/edit-drip-list-steps';
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

  export let dripList: DripList;
  export let format: 'thumblink' | 'full' = 'full';
  export let maxSplitsRows: number | undefined = undefined;

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
          size: 'medium',
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
          size: 'medium',
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
          size: 'medium',
          disableTooltip: true,
        },
      });
    }

    return result.flat();
  }
  $: supportersPile = getSupportersPile(supportStreams, incomingSplits);

  function triggerEditModal() {
    if (!representationalSplits) return;

    modal.show(
      Stepper,
      undefined,
      editDripListSteps(
        dripList.account.accountId,
        dripList.name,
        dripList.description,
        representationalSplits,
      ),
    );
  }
</script>

<svelte:element
  this={format === 'thumblink' ? 'a' : 'section'}
  href={format === 'thumblink' ? dripListUrl : undefined}
  class="rounded-drip-lg shadow-low group transform {format === 'thumblink'
    ? 'transition duration-200 mouse:hover:shadow-md mouse:hover:-translate-y-2px focus-visible:shadow-md focus-visible:-translate-y-2px'
    : ''}"
>
  <div class="flex flex-col gap-8" class:pointer-events-none={format === 'thumblink'}>
    <header class="px-6 pt-6 flex flex-col gap-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <h1 class="flex-1 min-w-0 truncate">
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
        <TextExpandable>
          {dripList.description}
        </TextExpandable>
      {/if}
    </header>

    <div class="list">
      <div class="totals">
        <div class="drip-icon">
          <Drip />
        </div>
        <div class="typo-text tabular-nums total-streamed-badge">
          {#if browser}
            <!-- TODO: Include incoming splits -->
            <AggregateFiatEstimate amounts={totalIncomingAmounts} />
          {/if}
          <span class="muted">&nbsp;total</span>
        </div>
        {#if supportersPile && supportersPile.length > 0}
          <div in:fade|local={{ duration: 300 }} class="supporters">
            <span class="muted">Supported by</span>
            <Pile components={supportersPile ?? []} itemsClickable={true} />
          </div>
        {/if}
      </div>
      {#if representationalSplits}
        <div class="splits-component">
          <Splits list={representationalSplits} maxRows={maxSplitsRows} />
        </div>
      {:else}
        Loading...
      {/if}
    </div>
  </div>
</svelte:element>

<style>
  .totals {
    display: flex;
    align-items: center;
    gap: 1rem;
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
