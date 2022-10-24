<script lang="ts">
  import type { Split } from '$lib/components/splits-table/splits-table.types';
  import MergeIcon from 'radicle-design-system/icons/Merge.svelte';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';

  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import SplitsTable from '$lib/components/splits-table/splits-table.svelte';

  let splitsData: Split[] = [
    {
      receiver: '0x1b358b965bdeadf16ddb76888243ec9ba0c41448',
      amount: '1000',
    },
    {
      receiver: '0x1a42cacb0f5b93f2569091fe9eecb627bfa34061',
      amount: '2000',
    },
    {
      receiver: '0x4adfede77b9fa48fd6ff427eeac8b61c32dd0cd4',
      amount: '3000',
    },
    {
      receiver: '0x0016c0d0343e8f2c3a7b6a51606b84b1545ec606',
      amount: '4000',
    },
  ];
</script>

<div class="section">
  <SectionHeader
    icon={MergeIcon}
    label="Splits"
    actions={[
      {
        handler: () => undefined,
        icon: PenIcon,
        label: 'Edit',
      },
    ]}
  />
  <div class="content pl-0.5">
    <SectionSkeleton
      emptyStateHeadline="No splits"
      emptyStateEmoji="🫗"
      emptyStateText="Anyone you split incoming funds with will appear here."
      loaded={true}
      empty={splitsData.length === 0}
    >
      <SplitsTable splits={splitsData} />
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
