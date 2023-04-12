<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onMount, tick } from 'svelte';
  import Copyable from '../copyable/copyable.svelte';

  export let text: string;
  export let copyable = false;
  export let disabled = false;

  let tooltipElem: HTMLSpanElement;
  let contentElem: HTMLSpanElement;
  let expanded = false;

  let tooltipPos = {
    left: 0,
    right: 0,
    top: 0,
  };

  const TOOLTIP_MARGIN = 0;

  async function show() {
    tooltipPos = {
      left: 0,
      right: 0,
      top: 0,
    };
    await tick();
    updatePos();
    expanded = true;
  }

  function hide() {
    expanded = false;
  }

  const MAX_WIDTH = 512;

  async function updatePos() {
    const triggerPos = tooltipElem.getBoundingClientRect();
    let contentPos = contentElem.getBoundingClientRect();

    let newLeft: number;
    let newTop: number;
    let newRight: number;

    const triggerCenter = triggerPos.left + triggerPos.width / 2;
    const width = Math.min(contentPos.width, MAX_WIDTH);
    newLeft = Math.max(triggerCenter - width / 2, 0);
    newRight = Math.max(Math.abs(triggerCenter - window.innerWidth) - width / 2, 0);

    // Set left & right already so that we can see how high the content will be.
    tooltipPos = {
      left: newLeft,
      right: newRight,
      top: 0,
    };

    // Wait for render, so that we can grab the actual content height given the new left & right vals.
    await tick();
    contentPos = contentElem.getBoundingClientRect();

    // Render the tooltip either above or below depending on position on screen.
    if (triggerPos.top > contentPos.height + TOOLTIP_MARGIN * 2) {
      newTop = triggerPos.top - contentPos.height - TOOLTIP_MARGIN;
    } else {
      newTop = triggerPos.bottom;
    }

    tooltipPos = {
      left: newLeft,
      right: newRight,
      top: newTop,
    };
  }

  onMount(() => {
    window.addEventListener('scroll', () => expanded && updatePos());
    window.addEventListener('resize', () => expanded && updatePos());

    return () => {
      window.removeEventListener('resize', () => expanded && updatePos());
      window.removeEventListener('scroll', () => expanded && updatePos());
    };
  });
</script>

<span
  bind:this={tooltipElem}
  class="tooltip"
  class:disabled
  on:mouseenter={() => !disabled && show()}
  on:mouseleave={() => !disabled && hide()}
>
  <slot />
  <div
    bind:this={contentElem}
    class="expanded-tooltip"
    class:visible={expanded}
    style:left={`${tooltipPos.left}px`}
    style:right={`${tooltipPos.right}px`}
    style:top={`${tooltipPos.top}px`}
  >
    <div class="target-buffer" />
    <div transition:fly|local={{ y: 5, duration: 300 }} class="tooltip-content typo-text">
      {#if copyable}
        <Copyable alwaysVisible value={text}><span class="content">{text}</span></Copyable>
      {:else}
        {text}
      {/if}
    </div>
  </div>
</span>

<style>
  .tooltip {
    position: relative;
    cursor: pointer;
    white-space: initial;
  }

  .expanded-tooltip {
    position: fixed;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    border: 8px solid transparent;
    box-sizing: border-box;
  }

  .tooltip-content {
    z-index: 10;
    box-shadow: var(--elevation-medium);
    background-color: var(--color-background);
    border-radius: 1rem;
    padding: 0.5rem 0.75rem;
    max-width: 512px;
    color: var(--color-foreground);
    text-align: left;
  }

  .content {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .visible {
    opacity: 1;
    pointer-events: all;
  }

  .target-buffer {
    height: 0.5rem;
    width: 100vw;
    max-width: 24rem;
  }
</style>
