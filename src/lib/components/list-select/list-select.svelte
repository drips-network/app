<script lang="ts">
  import SearchIcon from 'radicle-design-system/icons/MagnifyingGlass.svelte';
  import EyeClosedIcon from 'radicle-design-system/icons/EyeClosed.svelte';
  import type { Items } from './list-select.types';
  import { onMount } from 'svelte';
  import SelectedDot from '../selected-dot/selected-dot.svelte';

  export let items: Items;

  export let searchable = true;
  export let multiselect = false;
  export let blockInteraction = false;
  export let emptyStateText = 'Nothing to see here';

  let searchString = '';

  $: filteredItems = Object.fromEntries(
    Object.entries(items).filter((entry) => {
      const item = entry[1];
      const searchString =
        (item.searchString ?? (typeof item.label === 'string' && item.label)) || '';

      const startsWithSearchString = searchString
        .toLowerCase()
        .startsWith(searchString.toLowerCase());
      return startsWithSearchString || item.type === 'action';
    }),
  );

  $: noItems = Object.keys(items).length === 0;
  $: listIsEmpty =
    Object.values(filteredItems).filter((item) => item.type !== 'action').length === 0;

  export let selected: string[] = [];

  function selectItem(slug: string) {
    const item = items[slug];

    if (item.type === 'action') {
      item.handler();
      return;
    }

    if (multiselect) {
      if (selected.includes(slug)) {
        selected.splice(selected.indexOf(slug), 1);
        selected = selected;
      } else {
        selected = [...selected, slug];
      }
    } else {
      selected = [slug];
    }
  }

  function handleItemClick(e: MouseEvent, slug: string) {
    selectItem(slug);
    e.preventDefault();
  }

  const handleKeypress = (e: KeyboardEvent, slug: string) => {
    const selectKeys = ['Enter', ' '];
    if (!selectKeys.includes(e.key)) return;

    selectItem(slug);
    e.preventDefault();
  };

  let searchBarElem: HTMLDivElement;
  let itemElements: { [slug: string]: HTMLDivElement } = {};

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

  onMount(() => {
    window.addEventListener('keydown', handleArrowKeys);

    return () => window.removeEventListener('keydown', handleArrowKeys);
  });
</script>

<div class="list" style:pointer-events={blockInteraction ? 'none' : 'all'}>
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
  {#if listIsEmpty}
    <div class="empty-state">
      <EyeClosedIcon />
      {#if noItems}
        <p class="typo-text-bold">{emptyStateText}</p>
      {:else}
        <p class="typo-text-bold">No matches</p>
      {/if}
    </div>
  {/if}
  {#each Object.entries(items) as [slug, item]}
    <div
      class="item"
      class:selected={selected.includes(slug)}
      class:disabled={item.disabled}
      class:hidden={!Object.values(filteredItems).includes(item)}
      on:click={item.disabled ? undefined : (e) => handleItemClick(e, slug)}
      on:keydown={item.disabled ? undefined : (e) => handleKeypress(e, slug)}
      tabindex={item.disabled || blockInteraction ? undefined : 0}
      data-testid={`item-${slug}`}
      bind:this={itemElements[slug]}
    >
      {#if item.type === 'selectable' && !blockInteraction}
        <div class="check-icon">
          <SelectedDot type={multiselect ? 'check' : 'radio'} selected={selected.includes(slug)} />
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
          <span class="label typo-text-bold">{item.label}</span>
        {:else}
          <svelte:component this={item.label.component} {...item.label.props} />
        {/if}
        {#if item.type === 'selectable' && item.text}<span class="text typo-text-mono-bold"
            >{item.text}</span
          >{/if}
      </div>
    </div>
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
  }

  .hidden {
    display: none;
  }

  .item:not(.disabled) {
    cursor: pointer;
  }

  .item.disabled {
    opacity: 0.5;
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
