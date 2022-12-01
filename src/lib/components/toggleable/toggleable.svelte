<script lang="ts">
  import { sineInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import Toggle from '../toggle/toggle.svelte';

  export let toggled = false;
  export let label: string;

  let contentElem: HTMLDivElement;
  let contentHeight = tweened(0);

  let resizeObserver: ResizeObserver | undefined;

  let firstHeightUpdate = true;

  function retract() {
    contentHeight.set(0, { duration: 300, easing: sineInOut });
    resizeObserver?.disconnect();
    firstHeightUpdate = true;
  }

  function expand() {
    const updateHeight = (instant: boolean) => {
      const newHeight = contentElem.getBoundingClientRect().height;
      contentHeight.set(newHeight, { duration: instant ? 0 : 300, easing: sineInOut });
      firstHeightUpdate = false;
    };

    resizeObserver = new ResizeObserver(() => updateHeight(!firstHeightUpdate));
    resizeObserver.observe(contentElem);
  }

  $: {
    if (toggled) {
      expand();
    } else {
      retract();
    }
  }
</script>

<div class="toggleable">
  <div class="toggle" class:toggled>
    <Toggle bind:checked={toggled} {label} />
  </div>
  <div style:height={`${$contentHeight}px`} class="content">
    <div class="content-inner" bind:this={contentElem}>
      <slot />
    </div>
  </div>
</div>

<style>
  .content {
    overflow: hidden;
  }

  .content-inner {
    padding-top: 1rem;
  }

  .toggle {
    color: var(--color-foreground-level-5);
    transition: color 0.3s;
  }

  .toggle.toggled {
    color: var(--color-foreground-level-6);
  }
</style>
