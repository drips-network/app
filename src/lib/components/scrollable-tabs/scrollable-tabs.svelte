<script lang="ts" module>
  import { tick, type Component } from 'svelte';

  export type Tab = {
    href: string;
    icon: Component;
    label: string;
  };
</script>

<script lang="ts">
  import { run } from 'svelte/legacy';

  import { page } from '$app/state';
  import { quintInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import PaddedHorizontalScroll from '../padded-horizontal-scroll/padded-horizontal-scroll.svelte';

  interface Props {
    tabs: Tab[];
  }

  let { tabs }: Props = $props();

  let wrapperElem: HTMLDivElement | undefined = $state();
  let tabElems: HTMLAnchorElement[] = $state([]);
  let activeIndex: number | null = $state(null);

  run(() => {
    activeIndex = tabs.findIndex((tab) => tab.href === page.url.pathname);
  });

  const highlightBarWidth = tweened(0);
  const highlightBarLeft = tweened(0);

  let firstUpdate = $state(true);

  run(() => {
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
  });

  async function scrollTabIntoView(index: number) {
    await tick();
    const tab = tabElems[index];
    if (tab && wrapperElem) {
      wrapperElem.scrollTo({
        left: tab.offsetLeft - wrapperElem.offsetWidth / 2 + tab.offsetWidth / 2,
        behavior: 'smooth',
      });
    }
  }
  run(() => {
    if (activeIndex !== null) {
      scrollTabIntoView(activeIndex);
    }
  });
</script>

<PaddedHorizontalScroll bind:innerElem={wrapperElem}>
  <div class="scrollable-tabs">
    <div style:position="absolute" style:top="-4rem" id="scrollable-tabs-anchor"></div>
    {#each tabs as { href, icon, label }, i (href)}
      {@const SvelteComponent = icon}
      <a
        bind:this={tabElems[i]}
        {href}
        class="tab"
        style:color="var(--color-{i === activeIndex ? 'primary-level-6' : 'foreground'})"
      >
        <div class="icon">
          <SvelteComponent
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
