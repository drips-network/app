<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { cubicInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  const INIT_HEIGHT = 256;

  let containerHeight = tweened(INIT_HEIGHT, {
    duration: 300,
    easing: cubicInOut,
  });

  let contentContainerElem: HTMLDivElement;

  let observer: ResizeObserver;
  function observeContentChanges() {
    observer?.disconnect();
    if (!contentContainerElem) return;

    observer = new ResizeObserver(() => updateContainerHeight());
    observer.observe(contentContainerElem);
  }

  onDestroy(() => observer?.disconnect());

  $: {
    contentContainerElem;
    observeContentChanges();
  }

  async function updateContainerHeight(newHeight: number | void) {
    await tick();

    // Adding +1px to fix https://github.com/radicle-dev/drips-app-v2/issues/184
    newHeight = (newHeight ?? contentContainerElem.clientHeight) + 1;
    containerHeight.set(newHeight);
  }
</script>

<div class="transitioned-height" style:height="{$containerHeight}px">
  <div class="inner" bind:this={contentContainerElem}>
    <slot />
  </div>
</div>

<style>
  .transitioned-height {
    height: auto;
    overflow: hidden;
  }
</style>
