<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Copyable from '../copyable/copyable.svelte';
  import setTabIndexRecursively from '$lib/utils/set-tab-index-recursive';

  export let text: string | undefined = undefined;
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
    setContentFocussable(true);
  }

  function hide() {
    setContentFocussable(false);
    expanded = false;
  }

  let hoverTimeout: ReturnType<typeof setTimeout> | undefined;
  function handleHover(hovering: boolean) {
    clearTimeout(hoverTimeout);

    if (hovering) {
      hoverTimeout = setTimeout(show, 400);
    } else {
      hide();
    }
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

  function setContentFocussable(canFocus: boolean) {
    setTabIndexRecursively(contentElem, canFocus ? '0' : '-1');
  }

  onMount(() => {
    const updatePosIfExpanded = () => expanded && updatePos();

    window.addEventListener('scroll', updatePosIfExpanded);
    window.addEventListener('resize', updatePosIfExpanded);

    setContentFocussable(false);

    return () => {
      window.removeEventListener('scroll', updatePosIfExpanded);
      window.removeEventListener('resize', updatePosIfExpanded);
    };
  });
</script>

<span
  bind:this={tooltipElem}
  class="tooltip"
  class:disabled
  on:mouseenter={() => !disabled && handleHover(true)}
  on:mouseleave={() => !disabled && handleHover(false)}
>
  <div class="trigger"><slot /></div>
  <div
    bind:this={contentElem}
    class="expanded-tooltip"
    class:visible={expanded}
    style:left={`${tooltipPos.left}px`}
    style:right={`${tooltipPos.right}px`}
    style:top={`${tooltipPos.top}px`}
    on:click|stopPropagation
    on:keydown|stopPropagation
  >
    <div class="target-buffer" />
    <div class="tooltip-content typo-text" style:max-width={MAX_WIDTH}>
      {#if copyable && text}
        <Copyable alwaysVisible value={text}
          ><div class="inner"><slot name="tooltip-content" /></div></Copyable
        >
      {:else}
        <div class="inner"><slot name="tooltip-content" /></div>
      {/if}
    </div>
  </div>
</span>

<style>
  .tooltip {
    position: relative;
    white-space: initial;
    width: 100%;
    max-width: fit-content;
  }

  .trigger {
    user-select: none;
  }

  .expanded-tooltip {
    position: fixed;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    border: 8px solid transparent;
    box-sizing: border-box;
    max-width: fit-content;
    z-index: 2000;
  }

  .tooltip-content {
    z-index: 10;
    box-shadow: var(--elevation-medium);
    background-color: var(--color-background);
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.5rem 0.75rem;
    color: var(--color-foreground);
    text-align: left;
    max-width: fit-content;
    overflow: hidden;
  }

  .visible {
    opacity: 1;
    pointer-events: all;
  }

  .tooltip-content .inner {
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: fit-content;
  }

  .target-buffer {
    height: 0.5rem;
    width: 100%;
  }
</style>
