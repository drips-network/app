<script lang="ts">
  import SegmentedControl from '../segmented-control/segmented-control.svelte';

  interface Props {
    tabs?: Record<1 | 2, string>;
    ariaLabel: string;
    border?: boolean;
    activeTab?: string;
    tab1?: import('svelte').Snippet;
    tab2?: import('svelte').Snippet;
  }

  let {
    tabs = {
      1: 'Emoji',
      2: 'Custom image',
    },
    ariaLabel,
    border = false,
    activeTab = $bindable('tab1'),
    tab1,
    tab2,
  }: Props = $props();
</script>

<div class="tabbed-box whitespace-nowrap relative" class:with-border={border}>
  <div class="tabs">
    <SegmentedControl
      bind:active={activeTab}
      itemRole="tab"
      containerRole="tablist"
      {ariaLabel}
      options={[
        { title: tabs[1], value: 'tab1' },
        { title: tabs[2], value: 'tab2' },
      ]}
    />
  </div>
  {#if activeTab === 'tab1'}
    <div role="tabpanel">
      {@render tab1?.()}
    </div>
  {:else if activeTab === 'tab2'}
    <div role="tabpanel">
      {@render tab2?.()}
    </div>
  {/if}
</div>

<style>
  .tabbed-box {
    margin-top: 21px;
  }

  .tabbed-box.with-border {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
  }

  .tabs {
    position: absolute;
    top: -21px;
    display: flex;
    width: 100%;
    justify-content: center;
  }
</style>
