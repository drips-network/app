<script lang="ts">
  import Button from "$lib/components/button/button.svelte";
  import type { ComponentType } from "svelte";
  import { fly, slide } from "svelte/transition";
  import BezierEasing from "bezier-easing";

  export let icon: ComponentType;
  export let active = false;
  export let tonedDown = false;
  export let autoActive = true;
  export let padHeight = false;

  function handleHover(hovering: boolean) {
    if (!autoActive) return;

    active = hovering;
  }

  const easing = BezierEasing(0.47, 0, 0.23, 2);
</script>

<div class="wrapper" class:pad-height={padHeight}>
  <a href="wikipedia.com" class:toned-down={tonedDown} class="usecase-card" class:pad-height={padHeight} class:active on:mouseenter on:mouseenter={() => handleHover(true)} on:mouseleave on:mouseleave={() => handleHover(false)}>
    <div class="icon">
      <svelte:component this={icon} style="height: 2rem; width: 2rem; fill: var(--color-primary)" />
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
            <Button variant="primary">Read more</Button>
          </div>
        {/if}
      </div>
    </div>
    <div class="illustration">
      <slot name="illustration" {active} />
    </div>
  </a>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .wrapper.pad-height {
    height: 200px;
  }

  .usecase-card {
    position: relative;
    max-width: 332px;
    padding: 1rem;
    background-color: var(--color-background);
    display: flex;
    gap: 1.25rem;
    flex-direction: column;
    box-shadow: 0px 0px 0px 1px var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    box-sizing: border-box;
    transition: height 0.3s, box-shadow 0.3s, transform 0.3s, filter 0.3s;
  }

  .usecase-card.pad-height {
    height: 175px;
  }

  .usecase-card.active {
    background-color: var(--color-primary-level-1);
    box-shadow: 0px 0px 0px 1px var(--color-primary), 0 4px 0px 1px var(--color-primary);
    height: 220px;
  }

  .usecase-card.toned-down {
    transform: scale(0.95);
    filter: blur(0.8px) brightness(50%) contrast(90%);
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
</style>
