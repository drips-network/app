<script lang="ts">
  import SegmentedControl from '../segmented-control/segmented-control.svelte';

  export let tabs = {
    1: 'Emoji',
    2: 'Custom image',
  };

  export let ariaLabel: string;
  export let border = false;

  export let activeTab = 'tab-1';
</script>

<div class="tabbed-box whitespace-nowrap relative" class:with-border={border}>
  <div class="tabs">
    <SegmentedControl
      bind:active={activeTab}
      itemRole="tab"
      containerRole="tablist"
      {ariaLabel}
      options={[
        { title: tabs[1], value: 'tab-1' },
        { title: tabs[2], value: 'tab-2' },
      ]}
    />
  </div>
  {#if activeTab === 'tab-1'}
    <div role="tabpanel">
      <slot name="tab-1" />
    </div>
  {:else if activeTab === 'tab-2'}
    <div role="tabpanel">
      <slot name="tab-2" />
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
