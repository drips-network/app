<script lang="ts">
  import { type Component } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { sineInOut } from 'svelte/easing';
  import { page } from '$app/state';
  import { browser } from '$app/environment';

  type NavTarget = {
    type: 'target';
    name: string;
    newTab?: boolean;
    href: string;
    /** Whether it's possible to click on the item to go to the root href while active. */
    allowBacktrack?: boolean;
    icon: Component<{ style?: string }>;
    count?: number | null;
  };

  type Collection = {
    type: 'collection';
    name?: string;
    items: readonly NavTarget[];
  };

  type Item = NavTarget | Collection;

  interface Props {
    items: {
      top: Item[];
      bottom?: Item[];
    };
    collapsed?: boolean;
    isCurrentlyExpanded?: boolean;
    mode?: 'side' | 'hamburger';
  }

  let {
    items,
    collapsed = true,
    isCurrentlyExpanded = $bindable(false),
    mode = 'side',
  }: Props = $props();

  let isNavigating = $state(false);
  let hovering = $state(false);
  // 1. New state to track focus
  let focusedWithin = $state(false);
  let navEl: HTMLElement | undefined = $state();

  let hoverTimeout: ReturnType<typeof setTimeout> | undefined;

  // 2. Update logic: It is collapsed if NOT hovering AND NOT focused within
  let shouldBeCollapsed = $derived(collapsed && !hovering && !focusedWithin);

  $effect(() => {
    isCurrentlyExpanded = !shouldBeCollapsed;
  });

  const width = new Tween(3.5, {
    duration: 200,
    easing: sineInOut,
  });

  $effect(() => {
    if (shouldBeCollapsed) {
      width.set(3.5);
    } else {
      width.set(12);
    }
  });

  beforeNavigate(() => {
    isNavigating = true;
  });

  afterNavigate(() => {
    setTimeout(() => {
      isNavigating = false;
      if (navEl && !navEl.matches(':hover')) {
        hovering = false;
      }
      // Re-check focus on navigation end just in case
      if (navEl && !navEl.contains(document.activeElement)) {
        focusedWithin = false;
      }
    }, 400);
  });

  function isActive(href: string) {
    const currentPath = page.url.pathname;
    const flattenedItems: NavTarget[] = [];
    for (const item of [...items.top, ...(items.bottom || [])]) {
      if (item.type === 'target') {
        flattenedItems.push(item);
      } else if (item.type === 'collection') {
        flattenedItems.push(...item.items);
      }
    }

    let longestMatch = '';
    for (const item of flattenedItems) {
      if (item.href.length > longestMatch.length && currentPath.startsWith(item.href)) {
        longestMatch = item.href;
      }
    }

    return longestMatch === href;
  }

  function isActiveExact(href: string) {
    const currentPath = page.url.pathname;
    return currentPath === href;
  }

  function allowBacktrack(item: NavTarget) {
    if (!item.allowBacktrack) return false;
    return !isActiveExact(item.href);
  }

  let highlightEl: HTMLElement | undefined = $state();
  let navTargetEls: Record<string, HTMLElement> = $state({});

  let activeTargetEl = $derived(
    navTargetEls[Object.keys(navTargetEls).find((href) => isActive(href)) || ''],
  );

  let highlighterOffset = $derived(activeTargetEl ? activeTargetEl.offsetTop : 0);

  function handleWindowResize() {
    if (activeTargetEl) {
      highlighterOffset = activeTargetEl.offsetTop;
    }
  }
</script>

<svelte:window onresize={handleWindowResize} />

{#snippet navTarget(item: NavTarget, isActive: boolean, allowBacktrack: boolean)}
  <svelte:element
    this={isActive && !allowBacktrack ? 'div' : 'a'}
    href={item.href}
    target={item.newTab ? '_blank' : undefined}
    class="nav-item"
    style:width={mode === 'hamburger' ? '100%' : '12rem'}
    class:active={isActive}
    bind:this={navTargetEls[item.href]}
  >
    <item.icon
      style="fill: {isActive ? 'var(--color-primary-level-6)' : 'var(--color-foreground-level-6)'}"
    />
    {#if !shouldBeCollapsed}
      <span class="name typo-text" transition:fly={{ x: -4, duration: 200 }}>{item.name}</span>
      {#if item.count !== null && item.count !== undefined}
        <span class="count typo-text-small-bold">{item.count}</span>
      {/if}
    {/if}
  </svelte:element>
{/snippet}

{#snippet navList(items: Item[])}
  {#each items as item (item.name)}
    {#if item.type === 'target'}
      {@render navTarget(item, isActive(item.href), allowBacktrack(item))}
    {:else if item.type === 'collection'}
      <div class="collection">
        {#if item.name}
          {#if !shouldBeCollapsed}
            <h5 in:fly={{ x: -4, duration: 200 }}>{item.name}</h5>
          {:else}
            <div class="divider"></div>
          {/if}
        {/if}

        {#each item.items as subItem (subItem.name)}
          {@render navTarget(subItem, isActive(subItem.href), allowBacktrack(subItem))}
        {/each}
      </div>
    {/if}
  {/each}
{/snippet}

<nav
  bind:this={navEl}
  style:width={mode === 'hamburger' ? '100%' : `${width.current}rem`}
  onmouseenter={() => {
    isNavigating = false;
    hoverTimeout = setTimeout(() => {
      hovering = true;
    }, 50);
  }}
  onmouseleave={() => {
    clearTimeout(hoverTimeout);
    if (isNavigating) return;
    hovering = false;
  }}
  onfocusin={() => {
    // Immediate expansion on keyboard focus is usually preferred for accessibility
    focusedWithin = true;
  }}
  onfocusout={(e) => {
    // Check if the new focus target is still inside the nav
    // If we tab from Item 1 -> Item 2, relatedTarget will be Item 2 (inside nav)
    if (navEl && !navEl.contains(e.relatedTarget as Node)) {
      focusedWithin = false;
    }
  }}
  class:hamburgerMode={mode === 'hamburger'}
>
  {#if browser}
    <div
      class="item-highlighter"
      bind:this={highlightEl}
      in:fade={{ duration: 200 }}
      style:transform="translateY({highlighterOffset}px)"
    ></div>
  {/if}

  <div class="inner">
    {@render navList(items.top)}
    {#if items.bottom}
      <div class="spacer" style="flex-grow: 1"></div>
      {@render navList(items.bottom)}
    {/if}
  </div>
</nav>

<style>
  .item-highlighter {
    position: absolute;
    width: 100%;
    z-index: 1;
    background: var(--color-primary-level-1);
    border: 1px solid var(--color-primary);
    border-left: none;
    height: 2.5rem;
    border-radius: 0 0 1.25rem 0;
    view-transition-class: element-handover;
    view-transition-name: nav-highlighter;
  }

  .hamburgerMode .item-highlighter {
    border-radius: 1.5rem 0 1.5rem 1.5rem;
  }

  nav {
    height: 100%;
    overflow: hidden;
    position: relative;
    user-select: none;
    outline: none; /* Prevent default outline on nav container if it receives focus */
  }

  nav .inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    padding-bottom: 1rem;
    width: 14rem;
  }

  nav.hamburgerMode .inner {
    width: 100%;
  }

  .nav-item {
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 2.5rem;
    border-radius: 0 0 1.25rem 0;
    padding: 0 0.5rem 0 1rem;
    transition:
      0.2s background-color,
      0.2s color;
    /* Clean outline reset */
    outline: none;
    text-decoration: none;
  }

  .nav-item.active {
    color: var(--color-primary-level-6);
  }

  .nav-item:not(.active):hover {
    background-color: var(--color-primary-level-1);
    border-left: none;
    cursor: pointer;
  }

  .nav-item:focus-visible {
    z-index: 3; /* Ensure it sits above highlighter */
    background-color: var(--color-primary-level-1);
    /* Create a distinct focus ring inside the element */
    box-shadow: inset 0 0 0 2px var(--color-primary-level-6);
  }

  .nav-item .count {
    margin-left: auto;
    background-color: var(--color-primary-level-2);
    color: var(--color-primary-level-6);
    height: 1.5rem;
    line-height: 1.5rem;
    padding: 0 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    text-align: center;
  }

  .collection {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .collection h5 {
    font-size: 0.75rem;
    padding-left: 1rem;
    height: 1rem;
  }

  .divider {
    width: 1.5rem;
    height: 1px;
    background-color: var(--color-foreground-level-2);
    margin: 0.25rem 0 calc(0.75rem - 1px) 1rem;
  }
</style>
