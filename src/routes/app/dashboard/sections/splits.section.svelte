<script lang="ts">
  // TODO: handle "try again" (save inputs to localStorage)
  import type { UserId } from '$lib/stores/streams/types';
  import MergeIcon from 'radicle-design-system/icons/Merge.svelte';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';
  import { getSplitPercent } from '$lib/utils/get-split-percent';
  import { makeStep } from '$lib/components/stepper/types';
  import EditSplitsInputs from '../../../../lib/flows/edit-splits-flow/edit-splits-inputs.svelte';
  import SuccessStep from '$lib/components/success-step/success-step.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import modal from '$lib/stores/modal';
  import { AddressDriverClient, type SplitsEntry } from 'radicle-drips';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import SplitsTableFull from '$lib/components/splits-table/splits-table-full.svelte';
  import wallet from '$lib/stores/wallet';
  import editSplitsFlowState from '$lib/flows/edit-splits-flow/edit-splits-flow-state';
  import FetchSplits from '$lib/flows/edit-splits-flow/fetch-splits.svelte';

  export let userId: UserId | undefined;

  interface SplitsRow {
    userId: UserId;
    weight: bigint;
    address: string;
  }

  export let disableActions = true;

  let outgoingSplitsRaw: SplitsEntry[] | undefined;
  let outgoingSplits: SplitsRow[] | undefined;
  let incomingSplits: SplitsRow[] | undefined;
  let error = false;
  const subgraphClient = getSubgraphClient();

  $: {
    getOutgoingSplits(userId);
    fetchIncomingSplits(userId);
  }

  $: splitsTableData = buildSplitsTable(incomingSplits, outgoingSplits);

  $: isEmptySection = !outgoingSplits?.length && !incomingSplits?.length;

  async function getOutgoingSplits(userId: UserId | undefined, set = true) {
    try {
      if (!userId) throw new Error('userId not defined');

      outgoingSplits = undefined;
      error = false;

      const data = await subgraphClient.getSplitsConfigByUserId(userId);
      data.sort((a, b) => Number(b.weight - a.weight));

      if (set) {
        outgoingSplitsRaw = data;
        outgoingSplits = buildSplitsRows(data);
      }

      return data;
    } catch (e) {
      error = true;
    }
  }

  async function fetchIncomingSplits(userId: UserId | undefined) {
    try {
      if (!userId) throw new Error('userId not defined');

      incomingSplits = undefined;
      error = false;

      const data = await subgraphClient.getSplitEntriesByReceiverUserId(userId);

      data.sort((a, b) => Number(b.weight - a.weight));

      incomingSplits = buildSplitsRows(data, 'incoming');

      return data;
    } catch (e) {
      error = true;
    }
  }

  function buildSplitsRows(rawData: SplitsEntry[] = [], direction = 'outgoing') {
    // get address from sender or receiver userId
    return rawData.map(
      (row): SplitsRow => ({
        ...row,
        address: AddressDriverClient.getUserAddress(
          direction === 'incoming' ? row.senderId : row.userId,
        ),
      }),
    );
  }

  // build splits table component data
  function buildSplitsTable(incoming: SplitsRow[] = [], outgoing: SplitsRow[] = []) {
    const totalOutgoingWeight: bigint = outgoing.reduce(
      (acc: bigint, cur: { weight: bigint }) => acc + cur.weight,
      BigInt(0),
    );

    return {
      user: !userId
        ? '...'
        : userId === $wallet.dripsUserId
        ? 'You'
        : AddressDriverClient.getUserAddress(userId),
      incoming: {
        splits: incoming.map((s: SplitsRow) => {
          return {
            subject: { component: IdentityBadge, props: { address: s.address, isReverse: true } },
            percent: getSplitPercent(s.weight, 'pretty'),
          };
        }),
      },
      outgoing: {
        splits: outgoing.map((s: SplitsRow) => {
          return {
            subject: { component: IdentityBadge, props: { address: s.address } },
            percent: getSplitPercent(s.weight, 'pretty'),
          };
        }),
        splitsTotalPercent: getSplitPercent(totalOutgoingWeight, 'pretty'),
      },
    };
  }

  async function getOutgoingSplitsUpdate(): Promise<void> {
    const stringify = (data: any) =>
      JSON.stringify(data.map((d: SplitsRow) => ({ ...d, weight: d.weight.toString() })));

    const newData = await getOutgoingSplits(userId ?? '', false);

    // updated?
    if (stringify(outgoingSplitsRaw) !== stringify(newData)) {
      outgoingSplitsRaw = newData;
      outgoingSplits = buildSplitsRows(outgoingSplitsRaw);
      return;
    }

    // else, refetch after...
    await new Promise((r) => setTimeout(r, 500));
    return getOutgoingSplitsUpdate();
  }
</script>

<div class="section">
  <SectionHeader
    icon={MergeIcon}
    label="Splits"
    actionsDisabled={outgoingSplits === undefined}
    actions={disableActions
      ? []
      : [
          {
            handler: () => {
              modal.setHideable(true);
              modal.show(Stepper, undefined, {
                context: editSplitsFlowState,
                steps: [
                  makeStep({
                    component: FetchSplits,
                    props: undefined,
                  }),
                  makeStep({
                    component: EditSplitsInputs,
                    props: undefined,
                  }),
                  makeStep({
                    component: SuccessStep,
                    props: {
                      message: () => {
                        getOutgoingSplitsUpdate();
                        return (
                          'Your splits have been updated. ' +
                          'It may take some time to see changes in your dashboard.'
                        );
                      },
                    },
                  }),
                ],
              });
            },
            icon: PenIcon,
            label: 'Edit splits',
          },
        ]}
  />
  <div class="content pl-0.5">
    <SectionSkeleton
      emptyStateHeadline="No splits"
      emptyStateEmoji="🫧"
      emptyStateText="Anyone you split incoming funds with will appear here."
      loaded={outgoingSplits !== undefined || incomingSplits !== undefined}
      empty={isEmptySection}
      {error}
    >
      <div class="border rounded-lg py-8 lg:py-12">
        <SplitsTableFull data={splitsTableData} />
      </div>
    </SectionSkeleton>
  </div>
</div>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .content {
    overflow-y: scroll;
  }
</style>
