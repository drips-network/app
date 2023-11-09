<script lang="ts">
  import { browser } from '$app/environment';
  import highlightStore from '$lib/stores/highlight/highlight.store';
  import scrollStore from '$lib/stores/scroll/scroll.store';
  import { onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import FocusTrap from '../focus-trap/focus-trap.svelte';

  let highlightBB = $highlightStore?.element.getBoundingClientRect();
  function updateBB() {
    highlightBB = $highlightStore?.element.getBoundingClientRect();
  }

  $: $highlightStore && updateBB();

  function dismiss() {
    highlightStore.clearHighlight();
  }

  $: {
    if ($highlightStore && browser) {
      scrollStore.lock();
    } else if (browser) {
      scrollStore.unlock();
    }
  }

  onDestroy(() => {
    browser && scrollStore.unlock();
  });

  let highlightPos:
    | {
        x: number;
        y: number;
        width: number;
        textAlignment: 'left' | 'right';
        alignment: 'top' | 'bottom' | 'left' | 'right';
      }
    | undefined;
  function updateHighlightPos() {
    if (!highlightBB) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const remainingSpaceFromRight = highlightBB.right;
    const remainingSpaceFromLeft = windowWidth - highlightBB.left;
    const remainingSpaceFromTop = highlightBB.top;
    const remainingSpaceFromBottom = windowHeight - highlightBB.bottom;

    const textAlignment = remainingSpaceFromRight > remainingSpaceFromLeft ? 'right' : 'left';

    let highlightWidth: number;
    switch (textAlignment) {
      case 'left': {
        highlightWidth = Math.min(remainingSpaceFromLeft, 384);
        break;
      }
      case 'right': {
        highlightWidth = Math.min(remainingSpaceFromRight, 384);
        break;
      }
    }

    let alignment: 'top' | 'bottom' | 'left' | 'right';
    if (remainingSpaceFromTop < 64) {
      alignment = 'bottom';
    } else if (remainingSpaceFromTop > 64 && remainingSpaceFromBottom > 64) {
      alignment = textAlignment;
    } else {
      alignment = 'top';
    }

    let x: number;
    if (alignment === 'top' || alignment === 'bottom') {
      if (textAlignment === 'right') {
        x = highlightBB.right - highlightWidth;
      } else {
        x = highlightBB.left;
      }
    } else if (alignment === 'left') {
      x = highlightBB.right + 24;
    } else {
      x = highlightBB.left - 24;
    }

    let y: number;
    switch (alignment) {
      case 'left':
      case 'right': {
        // 12 is the height of half the arrow.
        y = highlightBB.top + highlightBB.height / 2 - 12;
        break;
      }
      case 'bottom': {
        y = highlightBB.bottom + 16;
        break;
      }
      case 'top': {
        y = highlightBB.top - 24;
      }
    }

    highlightPos = {
      x,
      y,
      textAlignment: textAlignment,
      width: highlightWidth,
      alignment,
    };
  }
  $: {
    if ($highlightStore && highlightBB) {
      updateHighlightPos();
    }
  }

  const ARROWS = {
    left: '←',
    right: '→',
    bottom: '↑',
    top: '↓',
  };

  const ANIMATION_SETTINGS = {
    left: {
      x: 16,
    },
    right: {
      x: -16,
    },
    top: {
      y: -16,
    },
    bottom: {
      y: 16,
    },
  };

  // Observe target element resizes and re-run calculations
  let observer: ResizeObserver | undefined;
  $: {
    if ($highlightStore && highlightBB) {
      observer?.disconnect();
      observer = new ResizeObserver(() => {
        updateBB();
        updateHighlightPos();
      });
      observer.observe($highlightStore.element);
    } else {
      observer?.disconnect();
    }
  }

  function handleClickCatcherEvent(e: MouseEvent | KeyboardEvent) {
    if (
      (e instanceof MouseEvent && e.type === 'click') ||
      (e instanceof KeyboardEvent && e.key === 'Enter')
    ) {
      // Forward to target
      $highlightStore?.element.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        }),
      );

      dismiss();
    }
  }

  function handleWindowKeyboardEvent(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      dismiss();
    }
  }

  let wrapperElem: HTMLDivElement;
</script>

<svelte:window on:keydown={handleWindowKeyboardEvent} />

<FocusTrap containers={new Set([wrapperElem])} enabled={Boolean($highlightStore)} />

{#if $highlightStore && highlightBB && highlightPos}
  <div
    transition:fade|local={{ duration: 300 }}
    class="highlight-wrapper"
    style:top="{highlightBB.top - $highlightStore.paddingPx}px"
    style:left="{highlightBB.left - $highlightStore.paddingPx}px"
    style:height="{highlightBB.height + $highlightStore.paddingPx * 2}px"
    style:width="{highlightBB.width + $highlightStore.paddingPx * 2}px"
    style:padding="{$highlightStore.paddingPx}px"
    bind:this={wrapperElem}
  >
    <div class="background" style:border-radius={$highlightStore.borderRadius} />
    <div class="animated-outline" style:border-radius={$highlightStore.borderRadius} />
    <div
      transition:fly|local={{ duration: 600, ...ANIMATION_SETTINGS[highlightPos.alignment] }}
      class="highlight {highlightPos.alignment} side-{highlightPos.textAlignment}"
      style:width="{highlightPos.width}px"
      style:top="{highlightPos.y}px"
      style:left="{highlightPos.x}px"
    >
      <h3 class="arrow">{ARROWS[highlightPos.alignment]}</h3>
      <div class="content">
        <h3>{$highlightStore.title}</h3>
        <p>{$highlightStore.description}</p>
      </div>
    </div>
    <!-- Dismisses clicks outside the target -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="click-preventer" on:click={dismiss} />
    <!-- Catches & forwards clicks on the target -->
    <div
      role="button"
      class="click-catcher"
      tabindex="0"
      style:top="{highlightBB.top - $highlightStore.paddingPx}px"
      style:left="{highlightBB.left - $highlightStore.paddingPx}px"
      style:height="{highlightBB.height + $highlightStore.paddingPx * 2}px"
      style:width="{highlightBB.width + $highlightStore.paddingPx * 2}px"
      on:mouseenter={handleClickCatcherEvent}
      on:mouseleave={handleClickCatcherEvent}
      on:click={handleClickCatcherEvent}
      on:keydown={handleClickCatcherEvent}
      style:border-radius={$highlightStore.borderRadius}
    />
  </div>
{/if}

<style>
  .highlight-wrapper {
    position: fixed;
    z-index: 101;
  }

  .animated-outline {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border: 2px solid var(--color-primary);
    pointer-events: none;
    z-index: 11;
    animation: animatedOutline 3s infinite linear;
  }

  @keyframes animatedOutline {
    0% {
      transform: scale(1);
      opacity: 0;
    }

    25% {
      transform: scale(1.25);
      opacity: 0.25;
    }

    50% {
      transform: scale(1.5);
      opacity: 0;
    }

    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }

  .click-preventer {
    z-index: 102;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .click-catcher {
    position: fixed;
    z-index: 103;
    cursor: pointer;
  }

  .click-catcher:focus-visible,
  .click-catcher:hover {
    outline: none;
    background-color: var(--color-primary-level-1);
  }

  .background {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.9;
    width: 100%;
    height: 100%;
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    pointer-events: none;
    box-shadow: 0px 0px 0px 99999px var(--color-background);
  }

  .highlight {
    position: fixed;
    z-index: 11;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: none;
  }

  .highlight.top {
    flex-direction: column-reverse;
  }

  .highlight.side-right {
    text-align: right;
  }

  .highlight.side-left {
    text-align: left;
  }
  .highlight .content h3 {
    margin-bottom: 0.5rem;
  }

  .highlight.top {
    transform: translateY(-100%);
  }

  .highlight.top .arrow {
    animation: ArrowBounceDown 3s infinite;
  }
  .highlight.bottom .arrow {
    animation: ArrowBounceUp 3s infinite;
  }
  .highlight.left .arrow {
    animation: ArrowBounceLeft 3s infinite;
  }
  .highlight.right .arrow {
    animation: ArrowBounceRight 3s infinite;
  }

  @keyframes ArrowBounceLeft {
    0% {
      transform: translateX(0rem);
    }

    12.5% {
      transform: translateX(-0.25rem);
    }

    25% {
      transform: translateX(0rem);
    }

    100% {
      transform: translateX(0rem);
    }
  }
  @keyframes ArrowBounceRight {
    0% {
      transform: translateX(0rem);
    }

    12.5% {
      transform: translateX(0.25rem);
    }

    25% {
      transform: translateX(0rem);
    }

    100% {
      transform: translateX(0rem);
    }
  }
  @keyframes ArrowBounceUp {
    0% {
      transform: translateY(0rem);
    }

    12.5% {
      transform: translateY(-0.25rem);
    }

    25% {
      transform: translateY(0rem);
    }

    100% {
      transform: translateY(0rem);
    }
  }
  @keyframes ArrowBounceDown {
    0% {
      transform: translateY(0rem);
    }

    12.5% {
      transform: translateY(0.25rem);
    }

    25% {
      transform: translateY(0rem);
    }

    100% {
      transform: translateY(0rem);
    }
  }
</style>
