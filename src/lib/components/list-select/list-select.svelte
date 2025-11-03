<script lang="ts">
  import SearchIcon from '$lib/components/icons/MagnifyingGlass.svelte';
  import EyeClosedIcon from '$lib/components/icons/EyeClosed.svelte';
  import type { Items } from './list-select.types';
  import SelectedDot from '../selected-dot/selected-dot.svelte';
  import PercentageEditor from '$lib/components/percentage-editor/percentage-editor.svelte';
  import VirtualList from 'svelte-tiny-virtual-list';

  export let items: Items;
  export let type: 'tokens' | 'generic' = 'generic';
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
    Object.entries(items || {}).filter((entry) => {
      const item = entry[1];
      if (item.type === 'interstitial') return;

      const itemSearchString =
        (item.searchString ?? (typeof item.label === 'string' && item.label)) || '';

      const searchStrings = Array.isArray(itemSearchString) ? itemSearchString : [itemSearchString];

      const startsWithSearchString = searchStrings.some((s) =>
        s.toLowerCase().startsWith(searchString.toLowerCase()),
      );

      return startsWithSearchString || item.type === 'action';
    }),
  );

  $: noItems = Object.keys(items).length === 0;
  $: listIsEmpty =
    Object.values(filteredItems).filter((item) => item.type !== 'action').length === 0;
  $: hasAnyItems = Object.keys(filteredItems).length > 0;

  export let selected: string[] = [];

  export let percentages: { [slug: string]: number } = {};

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

    // Check if focus is on search bar or any item
    const itemElemInFocus = Object.values(itemElements).find(
      (elem) => document.activeElement === elem,
    );

    if (!(searchBarElem === focussedElem || itemElemInFocus)) return;
    if (!(e.key === 'ArrowDown' || e.key === 'ArrowUp')) return;

    // Get the current focused slug
    const currentSlug = focussedSlug;

    // Get array of selectable slugs in order
    const selectableItems = itemsArray.filter(
      ([slug, item]) =>
        item.type !== 'interstitial' && (!hideUnselected || selected.includes(slug)),
    );

    const currentIndex = currentSlug
      ? selectableItems.findIndex(([slug]) => slug === currentSlug)
      : -1;

    switch (e.key) {
      case 'ArrowDown': {
        if (currentIndex === -1 && selectableItems.length > 0) {
          // Focus first item
          const firstSlug = selectableItems[0][0];
          itemElements[firstSlug]?.focus();
        } else if (currentIndex < selectableItems.length - 1) {
          // Focus next item
          const nextSlug = selectableItems[currentIndex + 1][0];
          itemElements[nextSlug]?.focus();
        }
        break;
      }
      case 'ArrowUp': {
        if (currentIndex > 0) {
          // Focus previous item
          const prevSlug = selectableItems[currentIndex - 1][0];
          itemElements[prevSlug]?.focus();
        } else if (currentIndex === 0) {
          // Focus search bar if at first item
          searchBarElem?.focus();
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

  // Convert filtered items to array for VirtualList
  $: itemsArray = Object.entries(filteredItems).filter(([slug, item]) => {
    if (hideUnselected && item.type === 'selectable') {
      return selected.includes(slug);
    }
    return true;
  });

  // Fixed item height for VirtualList
  const ITEM_HEIGHT = 48;
  const SEARCH_BAR_HEIGHT = 48;

  // Measure parent container height
  let containerElem: HTMLDivElement;
  let containerHeight = 0;

  $: if (containerElem) {
    containerHeight = containerElem.clientHeight;
  }

  // Calculate height: subtract search bar height if searchable, use parent height if available
  $: virtualListHeight =
    containerHeight > 0
      ? containerHeight - (searchable ? SEARCH_BAR_HEIGHT : 0)
      : Math.min(itemsArray.length * ITEM_HEIGHT, 1000);
</script>

<svelte:window on:keydown={handleArrowKeys} on:keydown={handleArrowKeys} />

<div
  bind:this={containerElem}
  role="listbox"
  aria-multiselectable={multiselect}
  class="list-select-container"
  style:pointer-events={blockInteraction ? 'none' : 'all'}
>
  {#if searchable}
    <div class="search-bar">
      <SearchIcon style="fill: var(--color-foreground)" />
      <input
        class="typo-text"
        bind:this={searchBarElem}
        bind:value={searchString}
        placeholder={type === 'tokens' ? 'Search tokens' : 'Search'}
      />
    </div>
  {/if}
  <div class="list-content">
    {#if listIsEmpty && showEmptyState}
      <div class="empty-state">
        <EyeClosedIcon />
        {#if noItems || !searchString}
          <p class="typo-text">{emptyStateText}</p>
        {:else}
          <p class="typo-text">No matches</p>
        {/if}
      </div>
    {/if}
    {#if hasAnyItems && itemsArray.length > 0}
      <VirtualList
        height={virtualListHeight}
        width="100%"
        itemCount={itemsArray.length}
        itemSize={ITEM_HEIGHT}
        getKey={(index) => itemsArray[index]?.[0] ?? `item-${index}`}
      >
        <div slot="item" let:index let:style {style}>
          {#if itemsArray[index]}
            {@const [slug, item] = itemsArray[index]}
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
                on:click={isItemDisabled(slug) || blockSelecting
                  ? undefined
                  : (e) => handleItemClick(e, slug)}
                on:keydown={isItemDisabled(slug) || blockSelecting
                  ? undefined
                  : (e) => handleKeypress(e, slug)}
                tabindex={isItemDisabled(slug) || blockSelecting || blockInteraction
                  ? undefined
                  : 0}
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
                    {#if item.type === 'selectable' && item.text}
                      {#if typeof item.text === 'string'}
                        <span class="text typo-text tabular-nums">
                          {item.text}
                        </span>
                      {:else}
                        <svelte:component this={item.text.component} {...item.text.props} />
                      {/if}
                    {/if}
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
          {/if}
        </div>
      </VirtualList>
    {/if}
  </div>
</div>

<style>
  .list-select-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .search-bar {
    height: 48px;
    padding: 0.75rem 1rem;
    flex-shrink: 0;
    background-color: var(--color-background);
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .list-content {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .search-bar input {
    outline: none;
    width: 100%;
  }

  .search-bar input::placeholder {
    color: var(--color-foreground-level-4);
  }

  .search-bar {
    border-bottom: 1px solid var(--color-foreground-level-3);
    display: flex;
    gap: 0.5rem;
  }

  .item {
    height: 48px;
    padding: 0 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
    user-select: none;
  }

  .empty-state {
    padding: 3rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    color: var(--color-foreground-level-5);
    text-align: center;
  }

  .item {
    transition: background-color 0.3s;
  }

  .interstitial {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 2rem 1rem 0.75rem 1rem;
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

  .content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    color: var(--color-foreground);
    gap: 1rem;
    min-width: 0;
  }

  .content .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .content .right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .item .content .text {
    color: var(--color-foreground-level-4);
    flex-shrink: 0;
  }

  .item .content.action {
    color: var(--color-foreground-level-4);
  }

  .check-icon {
    flex-shrink: 0;
  }
</style>
