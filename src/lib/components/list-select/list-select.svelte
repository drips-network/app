<script lang="ts">
  import SearchIcon from 'radicle-design-system/icons/MagnifyingGlass.svelte';
  import EyeClosedIcon from 'radicle-design-system/icons/EyeClosed.svelte';
  import CheckIcon from 'radicle-design-system/icons/CheckCircle.svelte';
  import type { Items } from './list-select.types';
  import { onMount } from 'svelte';

  export let items: Items;

  export let searchable = true;
  export let multiselect = false;

  let searchString = '';

  $: filteredItems = Object.fromEntries(
    Object.entries(items).filter((entry) => {
      const item = entry[1];
      const startsWithSearchString = item.label
        .toLowerCase()
        .startsWith(searchString.toLowerCase());
      return startsWithSearchString || item.type === 'action';
    }),
  );

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

  const handleItemClick = selectItem;

  const handleKeypress = (e: KeyboardEvent, slug: string) => {
    if (e.key !== 'Enter') return;
    selectItem(slug);
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

<div class="list">
  {#if searchable}
    <div class="search-bar">
      <SearchIcon />
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
      <p class="typo-text-bold">No matches</p>
    </div>
  {/if}
  {#each Object.entries(items) as [slug, item]}
    <div
      class="item"
      class:selected={selected.includes(slug)}
      class:hidden={!Object.values(filteredItems).includes(item)}
      on:click={() => handleItemClick(slug)}
      on:keydown={(e) => handleKeypress(e, slug)}
      tabindex="0"
      data-testid={`item-${slug}`}
      bind:this={itemElements[slug]}
    >
      <div class:hidden={!multiselect || !selected.includes(slug)} class="check-icon">
        <CheckIcon style="fill: var(--color-primary)" />
      </div>
      <div class:hidden={multiselect && selected.includes(slug)} class="image">
        {#if typeof item.image === 'string'}
          <img src={item.image} alt="List item" />
        {:else if item.image}
          <svelte:component this={item.image} />
        {/if}
      </div>
      <div class="content" class:action={item.type === 'action'}>
        <span class="label typo-text-bold">{item.label}</span>
        {#if item.type === 'selectable'}<span class="text typo-text-mono-bold">{item.text}</span
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

  .search-bar,
  .item {
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    gap: 0.5rem;
    color: var(--color-foreground);
  }

  .item:last-child {
    border-bottom: none;
  }

  .empty-state {
    padding: 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    color: var(--color-foreground-level-5);
  }

  .list {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .item {
    padding: 0.75rem 1rem;
    user-select: none;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .hidden {
    display: none;
  }

  .item.selected {
    background-color: var(--color-primary-level-1);
  }

  .item:hover,
  .item:focus {
    background-color: var(--color-foreground-level-1);
    outline: none;
  }

  .item.selected:hover,
  .item.selected:focus {
    background-color: var(--color-primary-level-2);
  }

  .image {
    height: 1.5rem;
    width: 1.5rem;
    flex-shrink: 0;
    border-radius: 1rem;
  }

  .item .content {
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: var(--color-foreground);
  }

  .item .content .text {
    color: var(--color-foreground-level-6);
    flex-shrink: 0;
  }

  .item .content.action {
    color: var(--color-foreground-level-4);
  }
</style>
