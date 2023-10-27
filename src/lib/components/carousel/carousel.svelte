<script lang="ts" context="module">
  import { onMount, tick, type SvelteComponent } from 'svelte';
  import { flip } from 'svelte/animate';
  import { quintInOut } from 'svelte/easing';
  import { crossfade, fade, fly } from 'svelte/transition';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Constructor<T> = new (...args: any[]) => T;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Props<T> = T extends SvelteComponent<infer P, any, any> ? P : never;
  type PropsOrUndefined<T> = Props<T> extends Record<string, never> ? undefined : Props<T>;

  interface CarouselItem<T extends SvelteComponent> {
    id: string;
    component: Constructor<T>;
    props: PropsOrUndefined<T>;
  }

  type SomeCarouselItem = <R>(step: <T extends SvelteComponent>(item: CarouselItem<T>) => R) => R;

  export function makeCarouselItem<T extends SvelteComponent>(
    i: CarouselItem<T>,
  ): SomeCarouselItem {
    return (cb) => cb(i);
  }

  export type CarouselItems = SomeCarouselItem[];
</script>

<script lang="ts">
  import ArrowUp from 'radicle-design-system/icons/ArrowUp.svelte';

  export let items: CarouselItems;
  $: resolvedItems = items.map((someCarouselItem) => someCarouselItem((i) => i));

  let itemsElem: HTMLDivElement;
  let itemElems: HTMLDivElement[] = [];

  let isMobile = false;
  async function updateIsMobile() {
    const newValue = window.matchMedia('(max-width: 577px)').matches;

    if (newValue !== isMobile) {
      isMobile = newValue;
      await tick();
      itemsElem.scroll(0, 0);
    }
  }

  onMount(() => {
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  });

  let scrollPos = 0;
  let scrolledToEnd = false;
  function updateScrollPos() {
    scrollPos = itemsElem.scrollLeft;
    scrolledToEnd = scrollPos + itemsElem.offsetWidth === itemsElem.scrollWidth;
  }

  onMount(() => {
    updateScrollPos();

    itemsElem.addEventListener('scroll', updateScrollPos);
    return () => itemsElem.removeEventListener('scroll', updateScrollPos);
  });

  $: numberOfItemsPerFold = isMobile ? 1 : 2;
  $: hasOverflow = resolvedItems.length > numberOfItemsPerFold;

  $: overflowRight = !scrolledToEnd;
  $: overflowLeft = scrollPos > 0;

  function navigate(direction: 'forward' | 'backward') {
    const scrollPadding = Number(
      window.getComputedStyle(itemsElem, null).getPropertyValue('scroll-padding').replace('px', ''),
    );
    const currentElem = itemElems.find((e) => e.offsetLeft === scrollPos + scrollPadding);
    if (!currentElem) return;

    const currentIndex = itemElems.indexOf(currentElem);
    const newOffset = itemElems[currentIndex + (direction === 'forward' ? 1 : -1)]?.offsetLeft;

    if (newOffset) {
      itemsElem.scroll({
        left: newOffset,
        behavior: 'smooth',
      });
    }
  }

  const [send] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node) {
      const style = getComputedStyle(node);
      const transform = style.transform === 'none' ? '' : style.transform;

      return {
        duration: 300,
        easing: quintInOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });
</script>

<div class="carousel" class:has-overflow={hasOverflow}>
  <div class="items" bind:this={itemsElem}>
    {#each resolvedItems as item, index (item.id)}
      <div
        class="item"
        bind:this={itemElems[index]}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 300 }}
        on:outroend={updateScrollPos}
      >
        <svelte:component this={item.component} {...item.props} />
      </div>
    {/each}
  </div>

  {#if overflowLeft}
    <div transition:fade={{ duration: 100 }} class="overflow-gradient left" />
    <button
      on:click={() => navigate('backward')}
      tabindex="-1"
      in:fly={{ x: 20, duration: 300 }}
      out:fly={{ x: -20, duration: 300 }}
      class="nav-button left"
    >
      <div><ArrowUp style="fill: var(--color-foreground)" /></div>
    </button>
  {/if}
  {#if overflowRight}
    <div transition:fade={{ duration: 100 }} class="overflow-gradient right" />
    <button
      on:click={() => navigate('forward')}
      tabindex="-1"
      in:fly={{ x: -20, duration: 300 }}
      out:fly={{ x: 20, duration: 300 }}
      class="nav-button right"
    >
      <div><ArrowUp style="fill: var(--color-foreground)" /></div>
    </button>
  {/if}
</div>

<style>
  .carousel {
    position: relative;
  }

  .items {
    display: flex;
    overflow: scroll;
    scroll-snap-type: x mandatory;
    gap: 1rem;
    padding: 0 2.5rem;
    scroll-padding: 2.5rem;
  }

  .item {
    flex-basis: 50%;
    scroll-snap-align: start;
  }

  .has-overflow .item {
    flex: 0 0 calc(50% - 0.5rem);
  }

  .overflow-gradient {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2.5rem;
  }

  .overflow-gradient.left {
    left: 0rem;
    background: linear-gradient(-90deg, rgba(0, 0, 0, 0), var(--color-background));
  }

  .overflow-gradient.right {
    right: 0rem;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0), var(--color-background));
  }

  .nav-button {
    position: absolute;
    top: calc(50% - 1.5rem);
    height: 3rem;
    width: 3rem;
    border-radius: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-background);
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground);
    transition: background-color 0.3s, box-shadow 0.3s, transform 0.1s;
  }

  .nav-button:hover {
    background-color: var(--color-foreground-level-2);
    box-shadow: inset 0px 0px 0px 2px var(--color-foreground);
  }

  .nav-button:active {
    transform: scale(0.98);
  }

  .nav-button.left {
    left: 2rem;
  }

  .nav-button.left div {
    transform: rotate(-90deg);
  }

  .nav-button.right {
    right: 2rem;
  }

  .nav-button.right div {
    transform: rotate(90deg);
  }

  @media (max-width: 1056px) {
    .nav-button {
      display: none;
    }

    .has-overflow .item {
      flex-basis: calc(50% - 4rem);
    }
  }

  @media (max-width: 577px) {
    .items {
      gap: 1rem;
    }

    .item {
      flex-basis: 100%;
      scroll-snap-align: center;
    }

    .has-overflow .item {
      flex: 0 0 calc(100% - 3rem);
    }
  }
</style>
