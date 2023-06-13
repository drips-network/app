<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { sineInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import Toggle from '../toggle/toggle.svelte';
  import setTabIndexRecursively from '$lib/utils/set-tab-index-recursive';

  export let toggled = false;
  export let label: string | undefined = undefined;
  export let removeFromTabIndexIfRetracted = true;
  export let showToggle = true;

  let contentElem: HTMLDivElement;
  let contentHeight = tweened(0);

  let resizeObserver: ResizeObserver | undefined;

  let firstHeightUpdate = true;

  function retract() {
    contentHeight.set(0, { duration: 300, easing: sineInOut });
    resizeObserver?.disconnect();
    firstHeightUpdate = true;

    if (!removeFromTabIndexIfRetracted || !contentElem) return;
    setTabIndexRecursively(contentElem, '-1');
  }

  async function expand() {
    await tick();

    const updateHeight = (instant: boolean) => {
      const newHeight = contentElem.getBoundingClientRect().height;
      contentHeight.set(newHeight, { duration: instant ? 0 : 300, easing: sineInOut });
      firstHeightUpdate = false;
    };

    resizeObserver = new ResizeObserver(() => updateHeight(!firstHeightUpdate));
    resizeObserver.observe(contentElem);

    if (!removeFromTabIndexIfRetracted || !contentElem) return;
    setTabIndexRecursively(contentElem, '0');
  }

  $: {
    if (toggled) {
      expand();
    } else {
      retract();
    }
  }

  onMount(() => {
    if (!toggled) setTabIndexRecursively(contentElem, '-1');
  });
</script>

<div class="toggleable">
  {#if showToggle}
    <div class="toggle" class:toggled>
      <Toggle bind:checked={toggled} {label} />
    </div>
  {/if}
  <div style:height={`${$contentHeight}px`} class="content">
    <div class="content-inner" style:padding-top={showToggle ? '1rem' : ''} bind:this={contentElem}>
      <slot />
    </div>
  </div>
</div>

<style>
  .content {
    overflow: hidden;
  }

  .toggle {
    color: var(--color-foreground-level-6);
    transition: color 0.3s;
  }

  .toggle.toggled {
    color: var(--color-foreground);
  }
</style>
