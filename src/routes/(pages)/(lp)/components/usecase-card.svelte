<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { ComponentType } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import BezierEasing from 'bezier-easing';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';

  export let icon: ComponentType;
  export let active = false;
  export let tonedDown = false;
  export let autoActive = true;
  export let padHeight = false;
  export let href: string;

  function handleHover(hovering: boolean) {
    if (!autoActive) return;

    active = hovering;
  }

  const easing = BezierEasing(0.47, 0, 0.23, 2);
</script>

<div class="wrapper" class:pad-height={padHeight}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class:toned-down={tonedDown}
    class="usecase-card"
    class:pad-height={padHeight}
    class:active
    on:mouseenter
    on:mouseenter={() => handleHover(true)}
    on:mouseleave
    on:mouseleave={() => handleHover(false)}
  >
    <div class="icon">
      <svelte:component
        this={icon}
        style="height: 2rem; width: 2rem; fill: {!tonedDown
          ? 'var(--color-primary)'
          : 'var(--color-primary-level-2)'}"
      />
      {#if !active}
        <div transition:fade={{ duration: 200 }}><ArrowRight /></div>
      {/if}
    </div>
    <div class="text">
      <h2 class="extra-bold">
        <slot name="headline" />
      </h2>
      <p>
        <slot name="description" />
      </p>
      <div>
        {#if active}
          <div transition:fly={{ duration: 300, y: 8, easing }} style:height="2.125rem">
            <Button {href} variant="primary">Read more</Button>
          </div>
        {/if}
      </div>
    </div>
    <div class="illustration">
      <slot name="illustration" {active} />
    </div>
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .icon {
    display: flex;
    justify-content: space-between;
  }

  .wrapper.pad-height {
    height: 200px;
  }

  .usecase-card {
    position: relative;
    user-select: none;
    max-width: 350px;
    padding: 1rem;
    background-color: var(--color-background);
    display: flex;
    gap: 1.25rem;
    flex-direction: column;
    box-shadow: 0px 0px 0px 1px var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    box-sizing: border-box;
    transition:
      height 0.3s,
      box-shadow 0.3s,
      transform 0.3s,
      filter 0.3s,
      background-color 0.3s;
  }

  .usecase-card.pad-height {
    height: 175px;
  }

  .usecase-card.active {
    background-color: var(--color-primary-level-1);
    box-shadow:
      0px 0px 0px 1px var(--color-primary),
      0 4px 0px 1px var(--color-primary);
    height: 220px;
  }

  .usecase-card.toned-down {
    transform: scale(0.95);
    background-color: var(--color-foreground-level-1);
    filter: blur(0.8px);
  }

  .usecase-card.toned-down h2,
  .usecase-card.toned-down p {
    color: var(--color-foreground-level-4);
  }

  h2,
  p {
    transition: color 0.3s;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .illustration {
    pointer-events: none;
    position: absolute;
    right: 0;
    width: 0px;
    transform: translate(-150px, -60%);
  }

  @media (pointer: coarse) {
  }
</style>
