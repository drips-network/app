<script lang="ts" context="module">
  import { onMount, tick, type SvelteComponent, type SvelteComponentTyped } from 'svelte';
  import { flip } from 'svelte/animate';
  import { quintInOut } from 'svelte/easing';
  import { crossfade, fade } from 'svelte/transition';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Constructor<T> = new (...args: any[]) => T;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Props<T> = T extends SvelteComponentTyped<infer P, any, any> ? P : never;
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
    itemsElem.addEventListener('scroll', updateScrollPos);
    return () => itemsElem.removeEventListener('scroll', updateScrollPos);
  });

  $: numberOfItemsPerFold = isMobile ? 1 : 2;
  $: hasOverflow = resolvedItems.length > numberOfItemsPerFold;

  $: overflowRight = !scrolledToEnd;
  $: overflowLeft = scrollPos > 0;

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
        out:send|local={{ key: item.id }}
        animate:flip={{ duration: 300 }}
      >
        <svelte:component this={item.component} {...item.props} />
      </div>
    {/each}
  </div>
  {#if overflowLeft}
    <div transition:fade={{ duration: 100 }} class="overflow-gradient left" />
  {/if}
  {#if overflowRight}
    <div transition:fade={{ duration: 100 }} class="overflow-gradient right" />
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
    padding: 0 4rem;
    scroll-padding: 4rem;
  }

  .item {
    flex-basis: 50%;
    scroll-snap-align: start;
  }

  .has-overflow .item {
    flex: 0 0 calc(50% - 0.5rem);
  }

  .has-overflow .overflow-gradient {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4rem;
  }

  .has-overflow .overflow-gradient.left {
    left: 0rem;
    background: linear-gradient(-90deg, rgba(0, 0, 0, 0), var(--color-background));
  }

  .has-overflow .overflow-gradient.right {
    right: 0rem;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0), var(--color-background));
  }

  @media (max-width: 1056px) {
    .has-overflow .item {
      flex-basis: calc(50% - 4rem);
    }
  }

  @media (max-width: 577px) {
    .items {
      gap: 1rem;
    }

    .item {
      flex-basis: calc(50% - 1rem);
      scroll-snap-align: center;
    }

    .has-overflow .item {
      flex: 0 0 calc(100% - 3rem);
    }
  }
</style>
