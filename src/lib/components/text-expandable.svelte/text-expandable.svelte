<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';

  interface Props {
    isExpandable?: boolean;
    numberOfLines?: number;
    children?: import('svelte').Snippet;
  }

  let { isExpandable = true, numberOfLines = 2, children }: Props = $props();

  let element: HTMLElement | undefined = $state(undefined);
  let isClamped = $state(false);
  let expanded: boolean | undefined = $state(undefined);

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
    {!expanded ? `line-clamp-${numberOfLines}` : ''}
    "
>
  {@render children?.()}
  {#if expanded === true}<button
      class="text-primary underline focus-visible:bg-primary-level-1 rounded hover:bg-primary-level-1 px-1 -ml-1"
      onclick={() => {
        expanded = false;
      }}>less</button
    >{/if}
  {#if isClamped && isExpandable}
    <button
      class="absolute overlay focus-visible:bg-primary-level-1 rounded"
      onclick={() => {
        expanded = true;
      }}
   ></button>
  {/if}
</div>
