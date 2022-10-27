<script lang="ts">
  import type { SplitsEntry } from '$lib/stores/splits/types';
  import type { UserId } from '$lib/stores/streams/types';
  import MergeIcon from 'radicle-design-system/icons/Merge.svelte';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import SplitsTable from '$lib/components/splits-table/splits-table.svelte';
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';
  import { getSplitPercent } from '$lib/stores/splits/methods/get-split-percent';
  import { makeStep } from '$lib/components/stepper/types';
  import EditSplitsInputs from './edit-splits-flow/edit-splits-inputs.svelte';
  import SuccessStep from '$lib/components/success-step/success-step.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import modal from '$lib/stores/modal';

  export let userId: string | undefined;

  let splitsData: SplitsEntry[] | undefined;
  let error = false;

  $: userId && getSplits(userId);

  $: splitsTableData = formatSplitsTable(splitsData ?? []);

  async function getSplits(userId: UserId) {
    splitsData = undefined;
    error = false;

    try {
      const subgraphClient = getSubgraphClient();
      splitsData = await subgraphClient.getSplitsConfigByUserId(userId);
    } catch (e) {
      error = true;
    }
  }

  function formatSplitsTable(splits: SplitsEntry[] = []) {
    const totalSplitsWeight: bigint = splits.reduce(
      (acc: bigint, cur: { weight: bigint }) => acc + cur.weight,
      BigInt(0),
    );

    return {
      splits: splits?.map((s: SplitsEntry) => ({
        text: s.userId,
        percent: getSplitPercent(s.weight, 'pretty'),
      })),
      splitsTotalPercent: getSplitPercent(totalSplitsWeight, 'pretty'),
      remainderPercent: getSplitPercent(BigInt('1000000') - totalSplitsWeight, 'pretty'),
      remainderReceiver: 'You',
    };
  }
</script>

<div class="section">
  <SectionHeader
    icon={MergeIcon}
    label="Splits"
    actionsDisabled={splitsData === undefined}
    actions={[
      {
        handler: () => {
          modal.show(Stepper, undefined, {
            steps: [
              makeStep({
                component: EditSplitsInputs,
                props: undefined,
              }),
              makeStep({
                component: SuccessStep,
                props: {
                  message:
                    'Your stream has been successfully created. ' +
                    'Please note that it may take a while for your dashboard to update.',
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
      loaded={splitsData !== undefined}
      empty={splitsData !== undefined && splitsData.length === 0}
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
