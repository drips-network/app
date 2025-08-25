<script lang="ts">
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import type { BottomNavItems } from './types';
  import { browser } from '$app/environment';
  import Ellipsis from '../icons/Ellipsis.svelte';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import Overflow from './overflow.svelte';

  export let items: BottomNavItems;

  $: bottomNavItems = items.slice(0, 4);
  $: isOverflowing = items.length > 4;

  interface ItemElems {
    [href: string]: HTMLAnchorElement;
  }

  let itemElems: ItemElems = {};
  $: activeElem = itemElems[$page.url.pathname];
  $: {
    activeElem;
    updateSelectorPos();
  }

  let selectorOffset: number | undefined = undefined;
  let selectorWidth: number | undefined = undefined;

  let resizeObserver: ResizeObserver | undefined = undefined;

  function updateResizeObserver(elem: HTMLElement | undefined) {
    if (!resizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        selectorWidth = activeElem.offsetWidth + 20;
      });
    }
    if (!elem) return;

    resizeObserver.disconnect();
    resizeObserver.observe(elem);
  }

  $: browser && updateResizeObserver(activeElem);

  function updateSelectorPos() {
    if (!activeElem) return;

    selectorOffset = activeElem.offsetLeft - 10;
  }

  function handleOverflowClick() {
    cupertinoPaneStore.openSheet(Overflow, { items });
  }
</script>

<svelte:window on:resize={updateSelectorPos} />

<div class="bottom-nav">
  <div class="items">
    {#each bottomNavItems as item}
      <a
        data-highlightid="bottomnav-{item.href}"
        class="item typo-text-small-bold"
        class:active={$page.url.pathname === item.href}
        bind:this={itemElems[item.href]}
        href={item.href}
      >
        <svelte:component
          this={item.icon}
          style="{$page.url.pathname === item.href
            ? 'fill: var(--color-primary-level-6)'
            : 'fill: var(--color-foreground)'}; transition: fill 0.3s;"
        />
        <span>
          {item.label}
        </span>
      </a>
    {/each}

    {#if isOverflowing}
      <button class="item typo-text-small-bold" on:click={handleOverflowClick}>
        <Ellipsis style="fill: var(--color-foreground)" />
        <span>More</span>
      </button>
    {/if}

    <div class="selector">
      {#if activeElem}
        <div
          class="selector"
          transition:fade={{ duration: 300 }}
          style={`left: ${selectorOffset}px; width: ${selectorWidth}px`}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 5rem;
    align-items: center;
    background-color: var(--color-background);
    border-top: 1px solid var(--color-foreground-level-3);
    z-index: 100;
    padding: 0 1rem;
    view-transition-name: bottom-nav;
  }

  .items {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    justify-content: space-around;
    max-width: 512px;
    margin: 0 auto;
    position: relative;
  }

  .item {
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    z-index: 100;
    transition: color 0.3s;
    font-size: 0.75rem;
  }

  .item.active {
    color: var(--color-primary-level-6);
  }

  .selector {
    background-color: var(--color-primary-level-1);
    position: absolute;
    left: 0;
    height: calc(100% - 0.5rem);
    margin: 0.25rem 0;
    border-radius: 1rem 0 1rem 1rem;
    transition:
      left 0.3s,
      width 0.3s;
  }
</style>
