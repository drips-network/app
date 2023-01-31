<script lang="ts">
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Table from '$lib/components/table/table.svelte';
  import TokensIcon from 'radicle-design-system/icons/Orgs.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import { balancesOptions } from './mock-balances-table';
  import { streamsOptions } from './mock-streams.table';

  /** After this many millis, one of the mock balances would become negative. */
  const MAX_MILLIS = 1004195;

  let millis = 0;

  setInterval(() => {
    millis = millis + 100;

    if (millis > MAX_MILLIS) millis = 0;
  }, 100);

  $: balances = balancesOptions(millis);
  $: streams = streamsOptions(millis);
</script>

<div class="mock-dashboard">
  <div class="section">
    <SectionHeader
      icon={TokensIcon}
      label="Balances"
      actions={[
        {
          label: 'Add funds',
          icon: Plus,
          handler: () => undefined,
        },
      ]}
    />
    <PaddedHorizontalScroll>
      <div class="table-container">
        <Table options={balances} />
      </div>
    </PaddedHorizontalScroll>
  </div>
  <div class="section">
    <SectionHeader
      icon={TokenStreams}
      label="Streams"
      actions={[
        {
          label: 'Create stream',
          icon: Plus,
          handler: () => undefined,
        },
      ]}
    />
    <PaddedHorizontalScroll>
      <div class="table-container typo-text">
        <Table options={streams} />
      </div>
    </PaddedHorizontalScroll>
  </div>
</div>

<style>
  .mock-dashboard {
    width: 100%;
    text-align: left;
    max-width: 80rem;
    display: flex;
    flex-direction: column;
    gap: 4rem;
    user-select: none;
    padding: 0 2rem;
    max-width: 64rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    margin: 0 -1rem;
  }

  .table-container {
    overflow-x: scroll;
  }
</style>
