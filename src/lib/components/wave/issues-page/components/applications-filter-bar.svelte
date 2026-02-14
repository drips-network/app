<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import Grid from '$lib/components/icons/Grid.svelte';
  import List from '$lib/components/icons/List.svelte';

  export type SortOption = {
    key: 'appliedAt' | 'oss_composite' | 'currentWaveAssignmentCount' | 'currentWavePointsEarned';
    direction: 'asc' | 'desc';
  };

  type SortPreset = {
    label: string;
    key: SortOption['key'];
    direction: SortOption['direction'];
  };

  const SORT_PRESETS: SortPreset[] = [
    { label: 'Creation Date (newest first)', key: 'appliedAt', direction: 'desc' },
    { label: 'Creation Date (oldest first)', key: 'appliedAt', direction: 'asc' },
    { label: 'OSS Activity Score (highest first)', key: 'oss_composite', direction: 'desc' },
    { label: 'OSS Activity Score (lowest first)', key: 'oss_composite', direction: 'asc' },
    {
      label: 'Current Assignments (fewest first)',
      key: 'currentWaveAssignmentCount',
      direction: 'asc',
    },
    {
      label: 'Current Assignments (most first)',
      key: 'currentWaveAssignmentCount',
      direction: 'desc',
    },
    {
      label: 'Points Earned this Wave (most first)',
      key: 'currentWavePointsEarned',
      direction: 'desc',
    },
    {
      label: 'Points Earned this Wave (fewest first)',
      key: 'currentWavePointsEarned',
      direction: 'asc',
    },
  ];

  const DROPDOWN_OPTIONS = SORT_PRESETS.map((preset, i) => ({
    value: String(i),
    title: preset.label,
  }));

  interface Props {
    viewMode: 'card' | 'list';
    sortBy: SortOption;
  }

  let { viewMode = $bindable(), sortBy = $bindable() }: Props = $props();

  const VIEW_MODE_KEY = 'wave:applications-view-mode';

  $effect(() => {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    if (stored === 'card' || stored === 'list') {
      viewMode = stored;
    }
  });

  $effect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  });

  let selectedPresetValue = $state('1');

  function handleSortChange(value: string) {
    selectedPresetValue = value;
    const preset = SORT_PRESETS[parseInt(value, 10)];
    sortBy = { key: preset.key, direction: preset.direction };
  }

  const STICKY_TOP_PX = 6.5 * 16; // 6.5rem in px

  let wrapperEl = $state<HTMLDivElement>();
  let isSticky = $state(false);

  function checkSticky() {
    if (!wrapperEl) return;
    const rect = wrapperEl.getBoundingClientRect();
    isSticky = rect.top <= STICKY_TOP_PX + 1;
  }

  $effect(() => {
    if (!wrapperEl) return;

    window.addEventListener('scroll', checkSticky, { passive: true });
    checkSticky();

    return () => window.removeEventListener('scroll', checkSticky);
  });
</script>

<div class="sticky-wrapper" class:is-sticky={isSticky} bind:this={wrapperEl}>
  <div class="gradient-overlay"></div>
  <div class="filter-bar">
    <div class="left">
      <Dropdown
        small
        value={selectedPresetValue}
        options={DROPDOWN_OPTIONS}
        onchange={handleSortChange}
      />
    </div>

    <div class="right">
      <Button
        size="small"
        variant="normal"
        icon={viewMode === 'card' ? List : Grid}
        ariaLabel={viewMode === 'card' ? 'Switch to list view' : 'Switch to card view'}
        onclick={() => (viewMode = viewMode === 'card' ? 'list' : 'card')}
      />
    </div>
  </div>
</div>

<style>
  .sticky-wrapper {
    position: sticky;
    top: 6.5rem;
    z-index: 1;
  }

  .gradient-overlay {
    position: absolute;
    left: -1rem;
    right: -1rem;
    bottom: -1.5rem;
    top: calc(-6.5rem - 1rem);
    background: linear-gradient(
      to bottom,
      var(--color-background) calc(100% - 3rem),
      transparent 100%
    );
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .sticky-wrapper.is-sticky .gradient-overlay {
    opacity: 1;
  }

  .filter-bar {
    position: relative;
    background-color: var(--color-background);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    transition: border-radius 0.2s;
  }

  .filter-bar:has(:global(.dropdown.expanded)) {
    border-bottom-left-radius: 0.25rem;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 18.5rem;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  @media (max-width: 768px) {
    .sticky-wrapper {
      top: 4rem;
    }

    .gradient-overlay {
      top: calc(-4rem - 1rem);
    }

    .filter-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    .left {
      width: 100%;
    }

    .right {
      justify-content: flex-end;
    }
  }
</style>
