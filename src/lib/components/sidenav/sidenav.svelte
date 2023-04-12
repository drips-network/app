<script lang="ts">
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import SidenavItem from './components/sidenav-item.svelte';
  import type { SidenavItems } from './types';

  export let items: {
    top: SidenavItems;
    bottom: SidenavItems;
  };

  interface ItemElems {
    [href: string]: HTMLDivElement;
  }

  let itemElemsTop: ItemElems = {};
  let itemElemsBottom: ItemElems = {};

  $: activeElem = itemElemsTop[$page.url.pathname] || itemElemsBottom[$page.url.pathname];
  $: activeElem && updateSelectorPos();

  let selectorPos: number | undefined = undefined;

  function updateSelectorPos() {
    if (activeElem) {
      selectorPos = activeElem.offsetTop;
    } else {
      selectorPos = undefined;
    }
  }
</script>

<svelte:window on:resize={updateSelectorPos} />

<nav class="sidenav">
  <div class="top">
    {#each items.top as item}
      <div bind:this={itemElemsTop[item.href]}>
        <SidenavItem {...item} active={$page.url.pathname === item.href} />
      </div>
    {/each}
  </div>
  <div class="bottom">
    {#each items.bottom as item}
      <div bind:this={itemElemsBottom[item.href]}>
        <SidenavItem {...item} active={false} />
      </div>
    {/each}
  </div>
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

  .top {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .bottom {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: auto;
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

  @media (max-width: 1252px) {
    .sidenav {
      width: 3rem;
    }
  }
</style>
