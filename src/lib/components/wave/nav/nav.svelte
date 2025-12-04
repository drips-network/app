<script lang="ts">
  import { type Component } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { afterNavigate } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { sineInOut } from 'svelte/easing';
  import { page } from '$app/state';
  import { browser } from '$app/environment';

  type NavTarget = {
    type: 'target';
    name: string;
    newTab?: boolean;
    href: string;
    icon: Component<{ style?: string }>;
  };

  type Collection = {
    type: 'collection';
    name?: string;
    items: NavTarget[];
  };

  type Item = NavTarget | Collection;

  interface Props {
    items: {
      top: Item[];
      bottom?: Item[];
    };
    collapsed?: boolean;
    isCurrentlyExpanded?: boolean;
  }

  let { items, collapsed = true, isCurrentlyExpanded = $bindable(false) }: Props = $props();

  let isNavigating = $state(false);
  let hovering = $state(false);
  let navEl: HTMLElement | undefined = $state();

  // Track the timer ID so we can cancel it
  let hoverTimeout: ReturnType<typeof setTimeout> | undefined;

  let shouldBeCollapsed = $derived(collapsed && !hovering);
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

  afterNavigate(() => {
    // 1. Do NOT unlock immediately. The View Transition animation
    // is likely still running (standard duration is ~250-300ms).
    setTimeout(() => {
      isNavigating = false;

      // 3. NOW check reality.
      if (navEl && !navEl.matches(':hover')) {
        hovering = false;
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

  let highlightEl: HTMLElement | undefined = $state();
  let navTargetEls: Record<string, HTMLElement> = $state({});

  let activeTargetEl = $derived(
    navTargetEls[Object.keys(navTargetEls).find((href) => isActive(href)) || ''],
  );

  let highlighterOffset = $derived(activeTargetEl ? activeTargetEl.offsetTop : 0);

  function handleWindowResize() {
    // Force re-calculation of highlighter offset
    if (activeTargetEl) {
      highlighterOffset = activeTargetEl.offsetTop;
    }
  }
</script>

<svelte:window onresize={handleWindowResize} />

{#snippet navList(items: Item[])}
  {#each items as item (item.name)}
    {#if item.type === 'target'}
      {@render navTarget(item, isActive(item.href))}
    {:else if item.type === 'collection'}
      <div class="collection">
        {#if item.name}
          {#if !shouldBeCollapsed}
            <h5>{item.name}</h5>
          {:else}
            <div class="divider"></div>
          {/if}
        {/if}

        {#each item.items as subItem (subItem.name)}
          {@render navTarget(subItem, isActive(subItem.href))}
        {/each}
      </div>
    {/if}
  {/each}
{/snippet}

{#snippet navTarget(item: NavTarget, isActive: boolean)}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svelte:element
    this={isActive ? 'div' : 'a'}
    onclick={() => {
      isNavigating = true;
    }}
    href={item.href}
    target={item.newTab ? '_blank' : undefined}
    class="nav-item"
    style:width="12rem"
    class:active={isActive}
    bind:this={navTargetEls[item.href]}
  >
    <item.icon
      style="fill: {isActive ? 'var(--color-primary-level-6)' : 'var(--color-foreground-level-6)'}"
    />
    {#if !shouldBeCollapsed}
      <span transition:fade={{ duration: 200 }}>{item.name}</span>
    {/if}
  </svelte:element>
{/snippet}

<nav
  bind:this={navEl}
  style:width="{width.current}rem"
  onmouseenter={() => {
    isNavigating = false;
    // Delay the expansion by 100ms
    hoverTimeout = setTimeout(() => {
      hovering = true;
    }, 50);
  }}
  onmouseleave={() => {
    // If user leaves before 100ms, cancel the expansion
    clearTimeout(hoverTimeout);

    if (isNavigating) return;
    hovering = false;
  }}
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

  nav {
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  nav .inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    padding-bottom: 1rem;
    width: 14rem;
  }

  .nav-item {
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 2.5rem;
    border-radius: 0 0 1.25rem 0;
    padding: 0 1rem;
    transition:
      0.2s background-color,
      0.2s color;
  }

  .nav-item.active {
    color: var(--color-primary-level-6);
  }

  .nav-item:not(.active):hover {
    background-color: var(--color-primary-level-1);
    border-left: none;
    cursor: pointer;
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
