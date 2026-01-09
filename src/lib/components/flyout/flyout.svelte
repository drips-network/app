<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  interface Props {
    direction?: 'left' | 'right';
    width?: string;
    visible?: boolean;
    trigger?: import('svelte').Snippet;
    content?: import('svelte').Snippet;
    disabled?: boolean;
    onclickWhileDisabled?: () => void;

    noPadding?: boolean;
    forceOpen?: boolean;
  }

  let {
    direction = 'left',
    width = '24rem',
    visible = $bindable(false),
    trigger,
    content,
    forceOpen = false,
    noPadding = false,
    disabled = false,
    onclickWhileDisabled = undefined,
  }: Props = $props();
  let triggerElem: HTMLDivElement;

  let timerId: NodeJS.Timeout;

  function handleHover(hovering: boolean) {
    if (disabled && hovering) return;

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
    if (e.target === triggerElem && !disabled) return (visible = true);
    if (triggerElem.contains(e.target as HTMLDivElement)) return;

    visible = false;
  }

  function handleClick() {
    if (disabled) onclickWhileDisabled?.();
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
    onmouseenter={() => handleHover(true)}
    onmouseleave={() => handleHover(false)}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="trigger-content" onkeydown={() => handleHover(true)} onclick={handleClick}>
      {@render trigger?.()}
    </div>
    {#if visible || forceOpen}
      <div transition:fly={{ y: 8 }} class="content" class:left={direction === 'left'} style:width>
        <div class="margin"></div>
        <div class="wrapper" style:padding={noPadding ? '' : '0.5rem'}>
          {@render content?.()}
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
    margin-top: 1rem;
    overflow: hidden;
  }

  .margin {
    position: absolute;
    height: 0.5rem;
    width: 100%;
  }
</style>
