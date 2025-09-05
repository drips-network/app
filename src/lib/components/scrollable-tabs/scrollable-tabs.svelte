<script lang="ts" context="module">
  import { tick, type ComponentType } from 'svelte';

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

  let wrapperElem: HTMLDivElement;
  let tabElems: HTMLAnchorElement[] = [];
  let activeIndex: number | null = null;

  $: {
    activeIndex = tabs.findIndex((tab) => tab.href === $page.url.pathname);
  }

  const highlightBarWidth = tweened(0);
  const highlightBarLeft = tweened(0);

  let firstUpdate = true;

  $: {
    if (activeIndex !== null) {
      const activeTab = tabElems[activeIndex];

      if (activeTab) {
        const animation = firstUpdate
          ? { duration: 0, easing: quintInOut }
          : { duration: 300, easing: quintInOut };

        highlightBarWidth.set(activeTab.offsetWidth, animation);
        highlightBarLeft.set(activeTab.offsetLeft, animation);

        firstUpdate = false;
      }
    }
  }

  async function scrollTabIntoView(index: number) {
    await tick();
    const tab = tabElems[index];
    if (tab) {
      wrapperElem.scrollTo({
        left: tab.offsetLeft - wrapperElem.offsetWidth / 2 + tab.offsetWidth / 2,
        behavior: 'smooth',
      });
    }
  }
  $: {
    if (activeIndex !== null) {
      scrollTabIntoView(activeIndex);
    }
  }
</script>

<PaddedHorizontalScroll bind:innerElem={wrapperElem}>
  <div class="scrollable-tabs">
    <div style:position="absolute" style:top="-4rem" id="scrollable-tabs-anchor" />
    {#each tabs as { href, icon, label }, i}
      <a
        bind:this={tabElems[i]}
        {href}
        class="tab"
        style:color="var(--color-{i === activeIndex ? 'primary-level-6' : 'foreground'})"
      >
        <div class="icon">
          <svelte:component
            this={icon}
            style="fill: var(--color-{i === activeIndex ? 'primary-level-6' : 'foreground'})"
          />
        </div>
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
    view-transition-class: element-handover;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-foreground-level-3);
    scroll-behavior: initial;
  }

  a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0;
    white-space: nowrap;
    transition: color 0.3s;
  }

  .highlight-bar {
    position: absolute;
    bottom: 2px;
    height: 4px;
    border-radius: 4px 4px 0 0;
    background-color: var(--color-primary);
  }
</style>
