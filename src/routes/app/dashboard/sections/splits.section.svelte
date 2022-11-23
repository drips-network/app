<script lang="ts">
  // TODO: handle "try again" (save inputs to localStorage)
  import type { UserId } from '$lib/stores/streams/types';
  import MergeIcon from 'radicle-design-system/icons/Merge.svelte';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import SplitsTable from '$lib/components/splits-table/splits-table.svelte';
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';
  import { getSplitPercent } from '$lib/utils/get-split-percent';
  import { makeStep } from '$lib/components/stepper/types';
  import EditSplitsInputs from './edit-splits-flow/edit-splits-inputs.svelte';
  import SuccessStep from '$lib/components/success-step/success-step.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import modal from '$lib/stores/modal';
  import { AddressDriverClient, type SplitsEntry } from 'radicle-drips';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';

  export let userId: UserId | undefined;

  interface SplitsRow {
    userId: UserId;
    weight: bigint;
    address: string;
  }

  export let disableActions = true;

  let splitsRaw: SplitsEntry[] | undefined;
  let splits: SplitsRow[] | undefined;
  let error = false;
  const subgraphClient = getSubgraphClient();

  $: getSplits(userId);

  $: splitsTableData = buildSplitsTable(splits ?? []);

  async function getSplits(userId: UserId | undefined, set = true) {
    try {
      if (!userId) throw new Error('userId not defined');

      splits = undefined;
      error = false;

      const data = await subgraphClient.getSplitsConfigByUserId(userId);

      data.sort((a, b) => Number(b.weight - a.weight));

      if (set) {
        splitsRaw = data;
        setSplits(data);
      }

      return data;
    } catch (e) {
      error = true;
    }
  }

  function setSplits(rawData: SplitsEntry[] = []) {
    // add address
    const data = rawData.map(
      (row): SplitsRow => ({
        ...row,
        address: AddressDriverClient.getUserAddress(row.userId),
      }),
    );

    splits = data;
  }

  function buildSplitsTable(splits: SplitsRow[] = []) {
    const totalSplitsWeight: bigint = splits.reduce(
      (acc: bigint, cur: { weight: bigint }) => acc + cur.weight,
      BigInt(0),
    );

    return {
      splits: splits?.map((s: SplitsRow) => {
        return {
          subject: { component: IdentityBadge, props: { address: s.address } },
          percent: getSplitPercent(s.weight, 'pretty'),
        };
      }),
      splitsTotalPercent: getSplitPercent(totalSplitsWeight, 'pretty'),
      remainderPercent: getSplitPercent(BigInt('1000000') - totalSplitsWeight, 'pretty'),
      remainderReceiver: 'You',
    };
  }

  async function getSplitsUpdate(): Promise<void> {
    const stringify = (data: any) =>
      JSON.stringify(data.map((d: SplitsRow) => ({ ...d, weight: d.weight.toString() })));

    const newData = await getSplits(userId ?? '', false);

    // updated?
    if (stringify(splitsRaw) !== stringify(newData)) {
      splitsRaw = newData;
      setSplits(splitsRaw);
      return;
    }

    // else, refetch after...
    await new Promise((r) => setTimeout(r, 500));
    return getSplitsUpdate();
  }
</script>

<div class="section">
  <SectionHeader
    icon={MergeIcon}
    label="Splits"
    actionsDisabled={splits === undefined}
    actions={disableActions
      ? []
      : [
          {
            handler: () => {
              modal.setHideable(true);
              modal.show(Stepper, undefined, {
                steps: [
                  makeStep({
                    component: EditSplitsInputs,
                    props: undefined,
                  }),
                  makeStep({
                    component: SuccessStep,
                    props: {
                      message: () => {
                        getSplitsUpdate();
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
            label: 'Edit',
          },
        ]}
  />
  <div class="content pl-0.5">
    <SectionSkeleton
      emptyStateHeadline="No splits"
      emptyStateEmoji="🫧"
      emptyStateText="Anyone you split incoming funds with will appear here."
      loaded={splits !== undefined}
      empty={splits !== undefined && splits.length === 0}
      {error}
    >
      <SplitsTable data={splitsTableData} />
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
    margin: 0 -1rem 0 -1rem;
    overflow-y: scroll;
  }

  @media (max-width: 1024px) {
    .content {
      padding: 0 1rem 0 1rem;
    }
  }
</style>
