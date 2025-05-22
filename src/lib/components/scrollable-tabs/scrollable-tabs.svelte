<script lang="ts" context="module">
  import { type ComponentType } from 'svelte';

  export type Tab = {
    href: string;
    icon: ComponentType;
    label: string;
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { quintInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import PaddedHorizontalScroll from '../padded-horizontal-scroll/padded-horizontal-scroll.svelte';

  export let tabs: Tab[];

  let tabElems: HTMLAnchorElement[] = [];
  let activeIndex: number | null = null;

  $: {
    activeIndex = tabs.findIndex((tab) => tab.href === $page.url.pathname);
  }

  const highlightBarWidth = tweened(0, {
    duration: 300,
    easing: quintInOut,
  });
  const highlightBarLeft = tweened(0, {
    duration: 300,
    easing: quintInOut,
  });

  $: {
    if (activeIndex !== null) {
      const activeTab = tabElems[activeIndex];

      if (activeTab) {
        highlightBarWidth.set(activeTab.offsetWidth);
        highlightBarLeft.set(activeTab.offsetLeft);
      }
    }
  }
</script>

<PaddedHorizontalScroll>
  <div class="scrollable-tabs">
    <div style:position="absolute" style:top="-4rem" id="scrollable-tabs-anchor" />
    {#each tabs as { href, icon, label }, i}
      <a bind:this={tabElems[i]} href="{href}#scrollable-tabs-anchor" class="tab">
        <div class="icon"><svelte:component this={icon} /></div>
        {label}
      </a>
    {/each}
    <div
      class="highlight-bar"
      style:width="{$highlightBarWidth}px"
      style:left="{$highlightBarLeft}px"
    ></div>
  </div>
</PaddedHorizontalScroll>

<style>
  .scrollable-tabs {
    overflow: hidden;
    display: flex;
    gap: 2rem;
    view-transition-name: scrollable-tabs;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0;
    white-space: nowrap;
  }

  .highlight-bar {
    position: absolute;
    bottom: 2px;
    height: 4px;
    border-radius: 4px 4px 0 0;
    background-color: var(--color-primary);
  }
</style>
