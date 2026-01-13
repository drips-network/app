<script lang="ts">
  import SearchIcon from '$lib/components/icons/MagnifyingGlass.svelte';
  import EyeClosedIcon from '$lib/components/icons/EyeClosed.svelte';
  import type { Items } from './list-select.types';
  import SelectedDot from '../selected-dot/selected-dot.svelte';
  import PercentageEditor from '$lib/components/percentage-editor/percentage-editor.svelte';

  let searchString = $state('');

  interface Props {
    items: Items;
    type?: 'tokens' | 'generic';
    searchable?: boolean;
    multiselect?: boolean;
    blockInteraction?: boolean;
    hideUnselected?: boolean;
    showEmptyState?: boolean;
    emptyStateText?: string;
    maxSelected?: number;
    blockSelecting?: boolean;
    selected?: string[];
    percentages?: { [slug: string]: number };
    onchange?: (selected: string[]) => void;
  }

  let {
    items,
    type = 'generic',
    searchable = true,
    multiselect = false,
    blockInteraction = false,
    hideUnselected = false,
    showEmptyState = true,
    emptyStateText = 'Nothing to see here',
    maxSelected = 10,
    blockSelecting = false,
    selected = $bindable([]),
    percentages = $bindable({}),
    onchange,
  }: Props = $props();

  let lastSelectedSlug: string | undefined;

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

      const remainingSlots = Math.max(maxSelected - selected.length, 0);

      const candidateSlugs = itemsToSelect
        .filter(([, item]) => item.type === 'selectable')
        .filter(([, item]) => !(item.type === 'selectable' && item.disabled))
        .filter(([slug]) => !selected.includes(slug))
        .map(([slug]) => slug);

      const orderedSlugs = candidateSlugs.includes(slug)
        ? [slug, ...candidateSlugs.filter((candidate) => candidate !== slug)]
        : candidateSlugs;

      const newSelections = orderedSlugs.slice(0, remainingSlots);

      selected = [...selected, ...newSelections];
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

    onchange?.(selected);
  }

  function handleItemClick(e: MouseEvent, slug: string) {
    selectItem(slug, e.shiftKey);
    e.preventDefault();
  }

  let searchBarElem = $state<HTMLDivElement>();
  let itemElements: { [slug: string]: HTMLDivElement } = $state({});
  let focussedSlug: string | undefined = $state();

  function handleArrowKeys(e: KeyboardEvent) {
    const focussedElem = document.activeElement;

    // Check if focus is on search bar or any item
    const itemElemInFocus = Object.values(itemElements).find(
      (elem) => document.activeElement === elem,
    );

    // Allow navigation if focus is in component OR we have a tracked focussedSlug
    if (!(searchBarElem === focussedElem || itemElemInFocus || focussedSlug)) return;

    // Handle Enter/Space to select the currently focused item
    if (e.key === 'Enter' || e.key === ' ') {
      // Ignore these if focus is on search bar
      if (searchBarElem === focussedElem) {
        return;
      }

      if (focussedSlug && !isItemDisabled(focussedSlug)) {
        selectItem(focussedSlug, e.shiftKey);
        e.preventDefault();
      }
      return;
    }

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
          focusItemAtIndex(0, firstSlug);
        } else if (currentIndex < selectableItems.length - 1) {
          // Focus next item
          const nextIndex = currentIndex + 1;
          const nextSlug = selectableItems[nextIndex][0];
          focusItemAtIndex(nextIndex, nextSlug);
        }
        break;
      }
      case 'ArrowUp': {
        if (currentIndex > 0) {
          // Focus previous item
          const prevIndex = currentIndex - 1;
          const prevSlug = selectableItems[prevIndex][0];
          focusItemAtIndex(prevIndex, prevSlug);
        } else if (currentIndex === 0) {
          // Focus search bar if at first item
          searchBarElem?.focus();
        }
        break;
      }
    }

    e.preventDefault();
  }

  function focusItemAtIndex(index: number, slug: string) {
    const itemElem = itemElements[slug];
    if (itemElem) {
      itemElem.focus();
    }
  }

  function isItemDisabled(slug: string) {
    const item = items[slug];

    return (
      item.type !== 'interstitial' &&
      (item.disabled || (!canSelectAnother && !selected.includes(slug)))
    );
  }

  // Measure parent container height
  let containerElem = $state<HTMLDivElement>();

  let filteredItems = $derived(
    Object.fromEntries(
      Object.entries(items || {}).filter((entry) => {
        const item = entry[1];
        if (item.type === 'interstitial') return;

        const itemSearchString =
          (item.searchString ?? (typeof item.label === 'string' && item.label)) || '';

        const searchStrings = Array.isArray(itemSearchString)
          ? itemSearchString
          : [itemSearchString];

        const startsWithSearchString = searchStrings.some((s) =>
          s.toLowerCase().startsWith(searchString.toLowerCase()),
        );

        return startsWithSearchString || item.type === 'action';
      }),
    ),
  );
  let noItems = $derived(Object.keys(items).length === 0);
  let listIsEmpty = $derived(
    Object.values(filteredItems).filter((item) => item.type !== 'action').length === 0,
  );
  let hasAnyItems = $derived(Object.keys(filteredItems).length > 0);
  let canSelectAnother = $derived(selected.length < maxSelected);

  // Reset focus when search changes
  $effect(() => {
    if (searchString !== undefined) {
      focussedSlug = undefined;
    }
  });

  // Convert filtered items to array for the list
  let itemsArray = $derived(
    Object.entries(filteredItems).filter(([slug, item]) => {
      if (hideUnselected && item.type === 'selectable') {
        return selected.includes(slug);
      }
      return true;
    }),
  );
</script>

<svelte:window onkeydown={handleArrowKeys} />

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
      {#each itemsArray as [slug, item] (slug)}
        <div>
          {#if item.type === 'interstitial'}
            <div class="interstitial">
              <h4>{item.label}</h4>
              <p class="typo-text-small">{item.description}</p>
            </div>
          {:else if !hideUnselected || selected.includes(slug)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              role="option"
              aria-selected={selected.includes(slug)}
              class="item"
              class:selected={selected.includes(slug)}
              class:disabled={isItemDisabled(slug)}
              onclick={isItemDisabled(slug) || blockSelecting
                ? undefined
                : (e) => handleItemClick(e, slug)}
              tabindex={isItemDisabled(slug) || blockSelecting || blockInteraction ? undefined : 0}
              data-testid={`item-${slug}`}
              bind:this={itemElements[slug]}
              onfocus={() => (focussedSlug = slug)}
              onblur={() => {
                // Don't clear focussedSlug immediately - keep it for keyboard navigation
                // Only clear if focus moves outside AND component is not visible
                requestAnimationFrame(() => {
                  const newFocus = document.activeElement;
                  const isFocusInList = Object.values(itemElements).some((el) => el === newFocus);

                  if (!isFocusInList && newFocus !== searchBarElem) {
                    // Check if component is still visible before clearing
                    if (containerElem && !containerElem.checkVisibility?.()) {
                      focussedSlug = undefined;
                    }
                  }
                });
              }}
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
                    <item.image.component {...item.image.props} />
                  {/if}
                </div>
              {/if}
              <div class="content" class:action={item.type === 'action'}>
                {#if typeof item.label === 'string'}
                  <span class="label typo-text">{item.label}</span>
                {:else}
                  <item.label.component {...item.label.props} />
                {/if}
                <div class="right">
                  {#if item.type === 'selectable' && item.text}
                    {#if typeof item.text === 'string'}
                      <span class="text typo-text tabular-nums">
                        {item.text}
                      </span>
                    {:else}
                      <item.text.component {...item.text.props} />
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
        </div>
      {/each}
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
    overflow: scroll;
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
