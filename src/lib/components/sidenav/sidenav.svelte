<script lang="ts">
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import SidenavItem from './components/sidenav-item.svelte';
  import type { SidenavItems } from './types';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';

  export let items: {
    top: SidenavItems;
    bottom: SidenavItems;
  };

  interface ItemElems {
    [href: string]: HTMLDivElement;
  }

  let itemElems: ItemElems = {};

  $: activeElem = itemElems[$page.url.pathname];
  $: {
    activeElem;
    updateSelectorPos();
  }

  let selectorPos: number | undefined = undefined;

  function updateSelectorPos() {
    if (activeElem) {
      selectorPos = activeElem.offsetTop;
    } else {
      selectorPos = undefined;
    }
  }

  $: shouldShowTooltips = $breakpointsStore?.breakpoint === 'desktop';

  let hoveringOver: string | undefined = undefined;
</script>

<svelte:window on:resize={updateSelectorPos} />

<nav class="sidenav">
  {#each Object.values(items) as block}
    <div class="block">
      {#each block as item}
        <div
          style="position: relative"
          bind:this={itemElems[item.href]}
          on:mouseenter={() => (hoveringOver = item.href)}
          on:focusin={() => (hoveringOver = item.href)}
          on:mouseleave={() => (hoveringOver = undefined)}
          on:focusout={() => (hoveringOver = undefined)}
        >
          <SidenavItem {...item} active={$page.url.pathname === item.href} />
          {#if shouldShowTooltips && hoveringOver === item.href}
            <div class="tooltip" transition:fly={{ duration: 300, x: -8 }}>
              {item.label}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/each}
  {#if selectorPos !== undefined}
    <div transition:fade={{ duration: 200 }} class="selector" style={`top: ${selectorPos}px`} />
  {/if}
</nav>

<style>
  .sidenav {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: space-between;
    height: 100%;
  }

  .block {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .selector {
    position: absolute;
    left: 0;
    width: 100%;
    height: 3rem;
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    border: 1px solid var(--color-primary);
    background-color: var(--color-primary-level-1);
    transition: top 0.3s;
    z-index: -1;
  }

  .tooltip {
    white-space: nowrap;
    position: absolute;
    top: 0.5rem;
    bottom: 0.5rem;
    padding: 0 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    left: calc(100% + 1rem);
    display: flex;
    align-items: center;
    background-color: var(--color-background);
    z-index: 200;
    box-shadow: var(--elevation-low);
  }

  @media (max-width: 1252px) {
    .sidenav {
      width: 3rem;
    }
  }
</style>
