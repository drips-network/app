<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Props {
    disableScroll?: boolean;
    innerElem?: HTMLDivElement | undefined;
    children?: import('svelte').Snippet;
  }

  let { disableScroll = false, innerElem = $bindable(), children }: Props = $props();

  let showLeftGradient = $state(false);
  let showRightGradient = $state(false);

  function handleScroll() {
    if (!innerElem) return;

    const { scrollLeft, scrollWidth, clientWidth } = innerElem;
    showLeftGradient = scrollLeft > 0;
    showRightGradient = scrollLeft + clientWidth < scrollWidth;
  }

  let resizeObserver: ResizeObserver | undefined = $state();

  function handleResize() {
    handleScroll();
  }

  function setupResizeObserver() {
    if (!innerElem) return;

    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(innerElem);
  }

  onMount(() => {
    setupResizeObserver();

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  });
</script>

<div class="wrapper" class:disable-scroll={disableScroll}>
  <div class="inner" onscroll={handleScroll} bind:this={innerElem}>
    <div class="content">
      {@render children?.()}
    </div>
  </div>
  {#if showLeftGradient}
    <div transition:fade={{ duration: 50 }} class="gradient left-edge"></div>
  {/if}
  {#if showRightGradient}
    <div transition:fade={{ duration: 50 }} class="gradient right-edge"></div>
  {/if}
</div>

<style>
  .wrapper {
    width: 100%;
    position: relative;
  }

  .wrapper .inner {
    overflow: scroll;
  }

  .wrapper.disable-scroll .inner {
    overflow: hidden;
  }

  .content {
    position: relative;
  }

  .inner > .content {
    min-width: 100%;
    padding: 1px 0; /* 1px so box-shadow outlined content is not clipped */
    width: fit-content;
  }

  .gradient {
    position: absolute;
    top: 0;
    bottom: 0;
    pointer-events: none;
    width: 1rem;
  }

  .gradient.left-edge {
    left: -0;
    background: linear-gradient(to right, var(--color-background) 0%, transparent);
  }

  .gradient.right-edge {
    right: 0;
    background: linear-gradient(to left, var(--color-background) 0%, transparent);
  }

  @media (max-width: 577px) {
    .wrapper {
      width: 100%;
    }

    .gradient {
      width: 1rem;
    }
  }
</style>
