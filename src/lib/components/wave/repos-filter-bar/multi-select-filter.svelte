<script lang="ts" generics="OT extends { label: string; value: string }[]">
  import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import scrollStore from '$lib/stores/scroll/scroll.store';
  import SelectedDot from '$lib/components/selected-dot/selected-dot.svelte';
  import { onMount } from 'svelte';

  const uid = crypto.randomUUID();

  interface Props {
    optionsPromise: Promise<OT>;
    selectedValues: string[];
    onchange: (values: string[]) => void;
    placeholder?: string;
  }

  let {
    optionsPromise,
    onchange,
    selectedValues = [],
    placeholder = 'Select...',
  }: Props = $props();

  let triggerEl = $state<HTMLButtonElement>();
  let popoverEl = $state<HTMLDivElement>();

  function positionPopover() {
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    const popoverEl = document.getElementById(`dropdown-${uid}`);

    if (popoverEl) {
      popoverEl.style.position = 'absolute';
      popoverEl.style.top = `${rect.bottom + window.scrollY + 8}px`;
      popoverEl.style.left = `${rect.left + window.scrollX}px`;
      popoverEl.style.width = `${Math.max(rect.width, 200)}px`;
      const maxHeight = window.innerHeight - rect.bottom - 16;
      popoverEl.style.maxHeight = `${maxHeight}px`;
    }
  }

  function handleToggle(value: string) {
    if (selectedValues.includes(value)) {
      onchange(selectedValues.filter((v) => v !== value));
    } else {
      onchange([...selectedValues, value]);
    }
  }

  let searchTerm = $state('');
  let popoverOpen = $state(false);

  function handlePopoverOpen() {
    popoverOpen = true;
    positionPopover();
    scrollStore.lock();
  }

  function handlePopoverClose() {
    searchTerm = '';
    popoverOpen = false;
    scrollStore.unlock();
  }

  function handleWindowResize() {
    if (popoverOpen) {
      positionPopover();
    }
  }

  onMount(() => {
    positionPopover();
  });

  let displayText = $derived.by(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} selected`;
  });
</script>

<svelte:window on:resize={handleWindowResize} />

<button
  bind:this={triggerEl}
  class="dropdown-trigger typo-text"
  class:has-selection={selectedValues.length > 0}
  popovertarget={`dropdown-${uid}`}
>
  <span class="name">
    {displayText}
  </span>

  <div class="chevron" class:rotated={popoverOpen}>
    <ChevronDown />
  </div>
</button>

<div
  bind:this={popoverEl}
  id={`dropdown-${uid}`}
  class="dropdown-content"
  onbeforetoggle={handlePopoverOpen}
  ontoggle={(e) => {
    if (e.newState === 'closed') handlePopoverClose();
  }}
  popover
>
  {#await optionsPromise}
    <div class="spinner">Loading...</div>
  {:then options}
    <div class="dropdown-options">
      <div class="search-bar">
        <input bind:value={searchTerm} type="text" placeholder="Search..." />
        {#if searchTerm}
          <button aria-label="Clear search" onclick={() => (searchTerm = '')}>
            <CrossCircle />
          </button>
        {/if}
      </div>

      <div class="options-list">
        {#each options.filter((option) => option.label
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) as { label, value } (value)}
          <button
            class="option"
            class:selected={selectedValues.includes(value)}
            onclick={() => handleToggle(value)}
          >
            <div class="check">
              <SelectedDot type="check" selected={selectedValues.includes(value)} />
            </div>
            <span>{label}</span>
          </button>
        {/each}
      </div>
    </div>
  {/await}
</div>

<style>
  .dropdown-trigger {
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-foreground-level-3);
    user-select: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    justify-content: space-between;
    transition:
      border-color 0.3s,
      background-color 0.3s;
    max-width: 22rem;
    background: var(--color-background);
  }

  .dropdown-trigger .name {
    flex-grow: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-trigger.has-selection {
    background-color: var(--color-primary-level-1);
    border-color: var(--color-primary-level-3);
  }

  .spinner {
    padding: 1rem;
    display: flex;
    justify-content: center;
  }

  .dropdown-content {
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-elevation-4);
    padding: 0;
    z-index: 5;
    transition:
      opacity 0.2s ease-in-out,
      transform 0.2s ease-in-out,
      overlay 0.2s ease-in-out allow-discrete,
      display 0.2s ease-in-out allow-discrete;

    opacity: 0;
    transform: translateY(0.25rem);

    view-transition-name: dropdown-content;
  }

  .dropdown-content .search-bar {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    border-bottom: 1px solid var(--color-foreground-level-3);
    outline: none;
  }

  .search-bar input {
    width: calc(100% - 2rem);
    border: none;
    padding: 0.5rem;
    outline: none;
    background: none;
    font-size: 1rem;
    color: var(--color-foreground);
  }

  .dropdown-content:popover-open {
    opacity: 1;
    transform: translateY(0);
  }

  .option {
    height: 2.5rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .option .check {
    flex-shrink: 0;
  }

  .option span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @starting-style {
    .dropdown-content:popover-open {
      opacity: 0;
      transform: translateY(0.25rem);
    }
  }

  .options-list {
    max-height: 15rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .dropdown-options button {
    min-width: 0;
    padding: 0.5rem 0.5rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .dropdown-options button:hover {
    background-color: var(--color-foreground-level-1);
  }

  .dropdown-options button.selected {
    background-color: var(--color-primary-level-1);
  }

  .chevron {
    transform: rotate(0deg);
    transition: transform 0.3s;
  }

  .chevron.rotated {
    transform: rotate(-180deg);
  }
</style>
