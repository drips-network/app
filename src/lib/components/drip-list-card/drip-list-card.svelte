<script lang="ts">
  import type { DripList } from '$lib/utils/metadata/types';
  import Pen from 'radicle-design-system/icons/Pen.svelte';
  import Button from '../button/button.svelte';
  import Drip from '../illustrations/drip.svelte';
  import Splits, { type Splits as RepresentationalSplits } from '../splits/splits.svelte';
  import streamsStore from '$lib/stores/streams/streams.store';
  import checkIsUser from '$lib/utils/check-is-user';
  import balancesStore from '$lib/stores/balances/balances.store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { onMount } from 'svelte';
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
  import type { Stream } from '$lib/stores/streams/types';
  import { fade } from 'svelte/transition';
  import { browser } from '$app/environment';

  export let dripList: DripList;
  export let representationalSplits: RepresentationalSplits;
  export let incomingSplits: Awaited<ReturnType<typeof getIncomingSplits>>;

  export let supportStreams: Stream[] = [];

  // TODO: Truncate the representational splits into a splits group after 4 items.

  $: listOwner = dripList.account.owner;

  $: isOwnList = $walletStore && checkIsUser(dripList.account.owner.accountId);

  onMount(async () => {
    if (!$streamsStore.accounts[listOwner.accountId]) {
      await streamsStore.fetchAccount(listOwner.accountId);
    }
  });

  function triggerEditModal() {
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

  function getSupportersPile(streams: typeof supportStreams, splits: typeof incomingSplits) {
    if (!supportStreams || !incomingSplits) return undefined;

    const result = [];

    result.push(
      splits.users.map((s) => ({
        component: IdentityBadge,
        props: {
          address: s.value.address,
          showIdentity: false,
          outline: true,
          size: 'medium',
          disableLink: true,
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
          disableLink: true,
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
          disableLink: true,
        },
      });
    }

    return result.flat();
  }
  $: supportersPile = getSupportersPile(supportStreams, incomingSplits);

  $: dripListUrl = `/app/drip-lists/${dripList.account.accountId}`;
</script>

<section class="card">
  <header class="px-6 pt-6 flex flex-col gap-4">
    <div class="flex flex-wrap justify-between">
      <h1 class="flex-1 min-w-0 truncate">
        <a
          href={dripListUrl}
          class="focus-visible:outline-none focus-visible:bg-primary-level-1 rounded"
        >
          {dripList.name}
        </a>
      </h1>
      <div class="flex items-center gap-4">
        <ShareButton url="https://drips.network/app/drip-lists/{dripList.account.accountId}" />
        {#if isOwnList}
          <Button on:click={triggerEditModal} icon={Pen}>Edit list</Button>
        {/if}
      </div>
    </div>
    {#if (dripList.description ?? '').length > 0}
      <p>{dripList.description}</p>
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
          <AggregateFiatEstimate
            amounts={$balancesStore &&
              balancesStore
                .getStreamEstimatesByReceiver('total', dripList.account.accountId)
                .map((e) => ({
                  amount: e.totalStreamed / BigInt(constants.AMT_PER_SEC_MULTIPLIER),
                  tokenAddress: e.tokenAddress,
                }))}
          />
        {/if}
        <span class="muted">&nbsp;total</span>
      </div>
      {#if supportersPile && supportersPile.length > 0}
        <div in:fade|local={{ duration: 300 }} class="supporters">
          <span class="muted">Supported by</span>
          <Pile components={supportersPile ?? []} />
        </div>
      {/if}
    </div>
    <div class="splits-component"><Splits list={representationalSplits} /></div>
  </div>
</section>

<style>
  .card {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

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
