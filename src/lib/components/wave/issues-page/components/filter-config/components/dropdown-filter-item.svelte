<script lang="ts" generics="OT extends { label: string; value: string }[]">
  import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import scrollStore from '$lib/stores/scroll/scroll.store';
  import type { DropdownConfig } from '../types';

  const uid = crypto.randomUUID();

  interface Props {
    config: DropdownConfig<OT>;
    selectedOption?: OT[number]['value'] | undefined;
    onchange: (value: OT[number]['value'] | null) => void;
  }

  let { config, onchange, selectedOption = $bindable(undefined) }: Props = $props();
  let { optionsPromise } = $derived(config);

  let triggerEl: HTMLButtonElement;
  let popoverEl: HTMLDivElement;

  function positionPopover() {
    const rect = triggerEl.getBoundingClientRect();
    const popoverEl = document.getElementById(`dropdown-${uid}`);

    if (popoverEl) {
      popoverEl.style.position = 'absolute';
      popoverEl.style.top = `${rect.bottom + window.scrollY + 8}px`;
      popoverEl.style.left = `${rect.left + window.scrollX}px`;
      popoverEl.style.width = `${rect.width}px`;
    }
  }

  function handleSelect(value: OT[number]['value'] | null) {
    if (!value) {
      selectedOption = undefined;
      onchange(null);
      popoverEl.hidePopover();
      return;
    }

    selectedOption = value;
    onchange(selectedOption);
    popoverEl.hidePopover();
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
</script>

<svelte:window on:resize={handleWindowResize} />

<button
  bind:this={triggerEl}
  class="dropdown-trigger typo-text"
  class:has-selection={!!selectedOption}
  popovertarget={`dropdown-${uid}`}
>
  <span class="name">
    {#if !selectedOption}
      All repositories
    {:else}
      {#await optionsPromise}
        Loading...
      {:then options}
        {@const selected = options.find((option) => option.value === selectedOption)}
        {#if selected}
          {selected.label}
        {:else}
          Unknown
        {/if}
      {/await}
    {/if}
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
    <div class="spinner">
      <Spinner />
    </div>
  {:then options}
    <div class="dropdown-options">
      <div class="search-bar">
        <input bind:value={searchTerm} type="text" placeholder="Search repos..." />
        <button aria-label="Clear search" onclick={() => (searchTerm = '')}>
          {#if searchTerm}
            <CrossCircle />
          {/if}
        </button>
      </div>

      <div class="options-list">
        <button class:selected={!selectedOption} onclick={() => handleSelect(null)}>
          All repositories
        </button>

        {#each options.filter((option) => option.label
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) as { label, value } (value)}
          <button class:selected={selectedOption === value} onclick={() => handleSelect(value)}>
            {label}
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
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    border: 1px solid var(--color-foreground-level-3);
    user-select: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    justify-content: space-between;
    transition:
      border-color 0.3s,
      background-color 0.3s;
    max-width: 20rem;
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
    padding: 0.4rem 0.6rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dropdown-options button:hover {
    background-color: var(--color-foreground-level-1);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .chevron {
    transform: rotate(0deg);
    transition: transform 0.3s;
  }

  .chevron.rotated {
    transform: rotate(-180deg);
  }
</style>
