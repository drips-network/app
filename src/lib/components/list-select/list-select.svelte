<script lang="ts">
  import SearchIcon from 'radicle-design-system/icons/MagnifyingGlass.svelte';
  import EyeClosedIcon from 'radicle-design-system/icons/EyeClosed.svelte';
  import type { Items } from './list-select.types';
  import SelectedDot from '../selected-dot/selected-dot.svelte';
  import PercentageEditor from '$lib/components/percentage-editor/percentage-editor.svelte';

  export let items: Items;

  export let searchable = true;
  export let multiselect = false;
  export let blockInteraction = false;
  export let hideUnselected = false;
  export let showEmptyState = true;
  export let emptyStateText = 'Nothing to see here';
  export let maxSelected = 10;
  export let blockSelecting = false;

  let searchString = '';

  $: filteredItems = Object.fromEntries(
    Object.entries(items).filter((entry) => {
      const item = entry[1];
      if (item.type === 'interstitial') return;

      const itemSearchString =
        (item.searchString ?? (typeof item.label === 'string' && item.label)) || '';

      const startsWithSearchString = itemSearchString
        .toLowerCase()
        .startsWith(searchString.toLowerCase());
      return startsWithSearchString || item.type === 'action';
    }),
  );

  $: noItems = Object.keys(items).length === 0;
  $: listIsEmpty =
    Object.values(filteredItems).filter((item) => item.type !== 'action').length === 0;

  export let selected: string[] = [];

  export let percentages: { [slug: string]: number } = Object.entries(items).reduce<{
    [slug: string]: number;
  }>((acc, [slug, item]) => {
    if (item.type === 'selectable') {
      acc[slug] = (item.editablePercentage?.initialWeight ?? 0) / 10000;
    }
    return acc;
  }, {});

  let lastSelectedSlug: string | undefined;

  $: canSelectAnother = selected.length < maxSelected;

  function selectItem(slug: string, shiftKey = false) {
    if (!canSelectAnother && !selected.includes(slug)) return;

    const item = items[slug];

    if (item.type === 'action') {
      item.handler();
      return;
    }

    // If shift key pressed, select all selectable items between the previously focussed item and the clicked item
    if (multiselect && shiftKey && lastSelectedSlug) {
      const focussedItem = items[lastSelectedSlug];
      const clickedItem = items[slug];

      if (focussedItem.type !== 'selectable' || clickedItem.type !== 'selectable') return;

      const focussedItemIndex = Object.keys(filteredItems).indexOf(lastSelectedSlug);
      const clickedItemIndex = Object.keys(filteredItems).indexOf(slug);

      const [startIndex, endIndex] =
        focussedItemIndex < clickedItemIndex
          ? [focussedItemIndex, clickedItemIndex]
          : [clickedItemIndex, focussedItemIndex];

      const itemsToSelect = Object.entries(filteredItems).slice(startIndex, endIndex + 1);

      selected = [
        ...selected,
        ...itemsToSelect
          .filter(([, item]) => item.type === 'selectable')
          .filter(([slug]) => !selected.includes(slug))
          .map(([slug]) => slug),
      ];
    } else if (multiselect) {
      if (selected.includes(slug)) {
        selected.splice(selected.indexOf(slug), 1);
        selected = selected;
      } else {
        selected = [...selected, slug];
      }
    } else {
      selected = [slug];
    }

    lastSelectedSlug = slug;
  }

  function handleItemClick(e: MouseEvent, slug: string) {
    selectItem(slug, e.shiftKey);
    e.preventDefault();
  }

  const handleKeypress = (e: KeyboardEvent, slug: string) => {
    const selectKeys = ['Enter', ' '];
    if (!selectKeys.includes(e.key)) return;

    selectItem(slug, e.shiftKey);
    e.preventDefault();
  };

  let searchBarElem: HTMLDivElement;
  let itemElements: { [slug: string]: HTMLDivElement } = {};
  let focussedSlug: string | undefined;

  function handleArrowKeys(e: KeyboardEvent) {
    const focussedElem = document.activeElement;

    const visibleEls = Object.values(itemElements).filter(
      (itemElement) => !itemElement.classList.contains('hidden'),
    );

    const itemElemInFocus = visibleEls.find((elem) => document.activeElement === elem);

    if (!(searchBarElem === focussedElem || itemElemInFocus)) return;
    if (!(e.key === 'ArrowDown' || e.key === 'ArrowUp')) return;

    switch (e.key) {
      case 'ArrowDown': {
        if (!itemElemInFocus) {
          visibleEls[0].focus();
          break;
        }

        visibleEls[visibleEls.indexOf(itemElemInFocus) + 1]?.focus();
        break;
      }
      case 'ArrowUp': {
        if (!itemElemInFocus) break;

        const previousElem = visibleEls[visibleEls.indexOf(itemElemInFocus) - 1];

        if (previousElem) {
          previousElem.focus();
        } else {
          searchBarElem.focus();
        }

        break;
      }
    }

    e.preventDefault();
  }

  function isItemDisabled(slug: string) {
    const item = items[slug];

    return (
      item.type !== 'interstitial' &&
      (item.disabled || (!canSelectAnother && !selected.includes(slug)))
    );
  }
</script>

<svelte:window on:keydown={handleArrowKeys} on:keydown={handleArrowKeys} />

<div
  role="listbox"
  aria-multiselectable={multiselect}
  class="list"
  style:pointer-events={blockInteraction ? 'none' : 'all'}
>
  {#if searchable}
    <div class="search-bar">
      <SearchIcon style="fill: var(--color-foreground)" />
      <input
        class="typo-text"
        bind:this={searchBarElem}
        bind:value={searchString}
        placeholder="Search…"
      />
    </div>
  {/if}
  {#if listIsEmpty && showEmptyState}
    <div class="empty-state">
      <EyeClosedIcon />
      {#if noItems}
        <p class="typo-text">{emptyStateText}</p>
      {:else}
        <p class="typo-text">No matches</p>
      {/if}
    </div>
  {/if}
  {#each Object.entries(items) as [slug, item]}
    {#if item.type === 'interstitial'}
      <div class="interstitial">
        <h4>{item.label}</h4>
        <p class="typo-text-small">{item.description}</p>
      </div>
    {:else if !hideUnselected || selected.includes(slug)}
      <div
        role="option"
        aria-selected={selected.includes(slug)}
        class="item"
        class:selected={selected.includes(slug)}
        class:disabled={isItemDisabled(slug)}
        class:hidden={!Object.values(filteredItems).includes(item)}
        on:click={isItemDisabled(slug) || blockSelecting
          ? undefined
          : (e) => handleItemClick(e, slug)}
        on:keydown={isItemDisabled(slug) || blockSelecting
          ? undefined
          : (e) => handleKeypress(e, slug)}
        tabindex={isItemDisabled(slug) || blockSelecting || blockInteraction ? undefined : 0}
        data-testid={`item-${slug}`}
        bind:this={itemElements[slug]}
        on:focus={() => (focussedSlug = slug)}
        on:blur={() => (focussedSlug = undefined)}
      >
        {#if item.type === 'selectable' && !hideUnselected && !blockSelecting}
          <div class="check-icon">
            <SelectedDot
              focussed={focussedSlug === slug}
              type={multiselect ? 'check' : 'radio'}
              selected={selected.includes(slug)}
            />
          </div>
        {/if}
        {#if item.image}
          <div class="image">
            {#if typeof item.image === 'string'}
              <img src={item.image} alt="List item" />
            {:else if item.image}
              <svelte:component this={item.image.component} {...item.image.props} />
            {/if}
          </div>
        {/if}
        <div class="content" class:action={item.type === 'action'}>
          {#if typeof item.label === 'string'}
            <span class="label typo-text">{item.label}</span>
          {:else}
            <svelte:component this={item.label.component} {...item.label.props} />
          {/if}
          <div class="right">
            {#if item.type === 'selectable' && item.text}<span class="text typo-text-mono"
                >{item.text}</span
              >{/if}
            {#if item.type === 'selectable' && item.editablePercentage}
              <PercentageEditor
                bind:percentage={percentages[slug]}
                disabled={!selected.includes(slug)}
              />
            {/if}
          </div>
        </div>
      </div>
    {/if}
  {/each}
</div>

<style>
  .search-bar {
    height: 48px;
    padding: 0.75rem 1rem;
  }

  .search-bar input {
    outline: none;
    width: 100%;
  }

  .search-bar input::placeholder {
    color: var(--color-foreground-level-4);
  }

  .search-bar,
  .item {
    border-bottom: 1px solid var(--color-foreground);
    display: flex;
    gap: 0.5rem;
    color: var(--color-foreground);
  }

  .item:last-child {
    border-bottom: none;
  }

  .item:has(+ .interstitial) {
    border-bottom: none;
  }

  .empty-state {
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    color: var(--color-foreground);
    text-align: center;
  }

  .list {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .item {
    padding: 0.75rem 1rem;
    user-select: none;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
  }

  .interstitial {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 2rem 1rem 0.75rem 1rem;
  }

  .hidden {
    display: none;
  }

  .item:not(.disabled) {
    cursor: pointer;
  }

  .item.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .item:not(.disabled):hover,
  .item:not(.disabled):focus {
    background-color: var(--color-foreground-level-1);
    outline: none;
  }

  .image {
    height: 1.5rem;
    width: 1.5rem;
    flex-shrink: 0;
    border-radius: 1rem;
  }

  .item .content {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    color: var(--color-foreground);
    flex-wrap: wrap;
  }

  .item .content .text {
    color: var(--color-foreground);
    flex-shrink: 0;
  }

  .item .content.action {
    color: var(--color-foreground-level-4);
  }
</style>
