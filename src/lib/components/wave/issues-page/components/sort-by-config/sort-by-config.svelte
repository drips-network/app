<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { IssueSortByOption } from '$lib/utils/wave/types/issue';

  let {
    availableSortByOptions,
    initiallySelected,
    onapply,
  }: {
    availableSortByOptions: IssueSortByOption[];
    initiallySelected: IssueSortByOption;
    onapply: (sortBy: IssueSortByOption) => void;
  } = $props();

  const FRIENDLY_NAME_MAP: Record<IssueSortByOption, string> = {
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    points: 'Points',
  };

  let selected: IssueSortByOption = $state(initiallySelected);

  function handleSelect(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    e.preventDefault();
    const { value } = e.currentTarget;

    selected = value as IssueSortByOption;
  }

  function handleApply() {
    onapply(selected);
  }

  export function reset() {
    selected = initiallySelected;
  }
</script>

<div class="sort-by-config">
  {#each availableSortByOptions as value (value)}
    {@const label = FRIENDLY_NAME_MAP[value]}
    <label for={label} class:selected={selected === value}>{label}</label>
    <input
      onchange={(e) => handleSelect(e)}
      checked={selected === value}
      id={label}
      type="radio"
      name="sortBy"
      {value}
    />
  {/each}

  <div class="actions">
    <Button variant="primary" onclick={handleApply}>Apply sorting</Button>
  </div>
</div>

<style>
  label {
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-foreground-level-3);
    user-select: none;
  }

  label.selected {
    background-color: var(--color-primary-level-1);
    border-color: var(--color-primary-level-3);
  }

  input {
    display: none;
  }

  .actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
</style>
