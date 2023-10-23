<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';

  export let isExpandable = true;

  let element: HTMLElement | undefined = undefined;
  let isClamped = false;
  let expanded: boolean | undefined = undefined;

  function setIsClamped() {
    isClamped = element ? element.scrollHeight > element.clientHeight : false;
  }

  let resizeObserver: ResizeObserver | undefined = undefined;

  onMount(() => {
    setIsClamped();
    if (element && browser && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => setIsClamped());
      resizeObserver.observe(element);
    }
  });

  onDestroy(() => resizeObserver && element && resizeObserver.unobserve(element));
</script>

<div
  bind:this={element}
  class="
    expandable-text relative
    {!expanded ? 'line-clamp-2' : ''}
    "
>
  <slot />
  {#if expanded === true}<button
      class="text-primary underline focus-visible:bg-primary-level-1 rounded hover:bg-primary-level-1 px-1 -ml-1"
      on:click={() => {
        expanded = false;
      }}>less</button
    >{/if}
  {#if isClamped && isExpandable}
    <button
      class="absolute overlay focus-visible:bg-primary-level-1 rounded"
      on:click={() => {
        expanded = true;
      }}
    />
  {/if}
</div>
