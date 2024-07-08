<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  export let direction: 'left' | 'right' = 'left';
  export let width = '24rem';

  export let visible = false;
  let triggerElem: HTMLDivElement;

  let timerId: NodeJS.Timeout;

  function handleHover(hovering: boolean) {
    clearTimeout(timerId);

    if (hovering) {
      visible = true;
    } else {
      timerId = setTimeout(() => {
        visible = false;
      }, 250);
    }
  }

  function handleFocusChange(e: FocusEvent) {
    if (e.target === triggerElem) return (visible = true);
    if (triggerElem.contains(e.target as HTMLDivElement)) return;

    visible = false;
  }

  onMount(() => {
    document.addEventListener('focusin', handleFocusChange);

    return () => document.removeEventListener('focusin', handleFocusChange);
  });
</script>

<div class="flyout">
  <div
    role="menu"
    class="trigger"
    tabindex="0"
    bind:this={triggerElem}
    on:mouseenter={() => handleHover(true)}
    on:mouseleave={() => handleHover(false)}
  >
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="trigger-content"
      on:keydown={() => handleHover(true)}
      on:click|stopPropagation={() => handleHover(true)}
    >
      <slot name="trigger" />
    </div>
    {#if visible}
      <div transition:fly={{ y: 8 }} class="content" class:left={direction === 'left'} style:width>
        <div class="margin" />
        <div class="wrapper">
          <slot name="content" />
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .trigger {
    position: relative;
  }

  .trigger:focus {
    outline: none;
  }

  .trigger-content {
    cursor: pointer;
  }

  .content {
    position: absolute;
    z-index: 3;
    left: 0;
    max-width: calc(100vw - 2rem);
  }

  .content.left {
    left: initial;
    right: 0;
  }

  .wrapper {
    background-color: var(--color-background);
    box-shadow: var(--elevation-medium);
    border-radius: 1.25rem 0 1.25rem 1.25rem;
    padding: 0.5rem;
    margin-top: 1rem;
  }

  .margin {
    position: absolute;
    height: 0.5rem;
    width: 100%;
  }
</style>
