<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { sineInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import Toggle from '../toggle/toggle.svelte';

  export let toggled = false;
  export let label: string;
  export let removeFromTabIndexIfRetracted = true;

  let contentElem: HTMLDivElement;
  let contentHeight = tweened(0);

  let resizeObserver: ResizeObserver | undefined;

  let firstHeightUpdate = true;

  const TABBABLE_ELEMS = ['INPUT', 'BUTTON'];

  function setTabIndexRecursively(elem: Element, value: '-1' | '0') {
    for (const child of elem.children ?? []) {
      if (TABBABLE_ELEMS.includes(child.tagName)) child.setAttribute('tabindex', value);
      setTabIndexRecursively(child, value);
    }
  }

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
    color: var(--color-foreground-level-6);
    transition: color 0.3s;
  }

  .toggle.toggled {
    color: var(--color-foreground);
  }
</style>
