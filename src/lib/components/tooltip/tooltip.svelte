<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import Copyable from '../copyable/copyable.svelte';

  export let text: string;
  export let copyable = false;

  let tooltipElem: HTMLSpanElement;
  let contentElem: HTMLSpanElement;
  let expanded = false;

  let tooltipPos = {
    left: 0,
    right: 0,
    top: 0,
  };

  const TOOLTIP_MARGIN = 0;

  function show() {
    updatePos();
    expanded = true;
  }

  let direction: 'up' | 'down' = 'up';

  const MAX_WIDTH = 512;

  function updatePos() {
    const triggerPos = tooltipElem.getBoundingClientRect();
    const contentPos = contentElem.getBoundingClientRect();

    let newLeft: number;
    let newTop: number;
    let newRight: number;

    if (triggerPos.top > contentPos.height + TOOLTIP_MARGIN * 2) {
      newTop = triggerPos.top - contentPos.height - TOOLTIP_MARGIN;
      direction = 'up';
    } else {
      newTop = triggerPos.bottom;
      direction = 'down';
    }

    const triggerCenter = triggerPos.left + triggerPos.width / 2;
    newLeft = Math.max(triggerCenter - MAX_WIDTH / 2, 0);
    newRight = Math.max(Math.abs(triggerCenter - window.innerWidth) - MAX_WIDTH / 2, 0);

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
  on:mouseenter={show}
  on:mouseleave={() => (expanded = false)}
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
  <div class="triangle" class:down={direction === 'down'} class:visible={expanded} />
</span>

<style>
  .tooltip {
    position: relative;
    cursor: pointer;
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
    color: var(--color-foreground-level-6);
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

  .triangle {
    opacity: 0;
    pointer-events: none;
    position: absolute;
    bottom: calc(100%);
    left: 50%;
    height: 0;
    width: 0;
    transform: translateX(-50%);
    border-left: 0.5rem solid transparent;
    border-right: 0.5rem solid transparent;
    border-top: 0.5rem solid var(--color-background);
    transition: opacity 0.3s;
  }

  .triangle.visible {
    opacity: 1;
    pointer-events: all;
  }

  .triangle.down {
    border-top: none;
    top: calc(100%);
    border-bottom: 0.5rem solid var(--color-background);
  }
</style>
