<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '../button/button.svelte';
  import { browser } from '$app/environment';
  interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children?: import('svelte').Snippet<[any]>;
  }

  let { children }: Props = $props();

  let expanded = $state(false);

  function toggleExpand() {
    expanded = !expanded;

    if (!expanded) {
      // scroll to the top when collapsing
      window.scrollTo({
        top: containerElem.getBoundingClientRect().top + document.documentElement.scrollTop - 80,
      });
    }
  }

  let containerElem: HTMLDivElement;
  let overflown = $state(false);

  let isLong = $state(false);

  function isOverflown() {
    return containerElem.scrollHeight > containerElem.clientHeight;
  }

  const resizeObserver = browser
    ? new ResizeObserver(() => {
        overflown = isOverflown();

        if (overflown) {
          // if this is true once, it will always be true
          isLong = true;
        }
      })
    : null;
  onMount(() => {
    overflown = isOverflown();

    resizeObserver?.observe(containerElem);
    return () => {
      resizeObserver?.disconnect();
    };
  });
</script>

<div bind:this={containerElem} class="expandable-text" class:expanded>
  {@render children?.({ isLong })}
  {#if overflown || expanded}
    <div class="expand-button">
      <Button onclick={toggleExpand}>
        {expanded ? 'Show less' : 'Show more'}
      </Button>
    </div>
    {#if !expanded}
      <div class="fadeout-gradient"></div>
    {/if}
  {/if}
</div>

<style>
  .expandable-text {
    position: relative;
    max-height: 20rem;
    max-width: 100%;
    overflow: hidden;
  }

  .expandable-text.expanded {
    max-height: none;
  }

  .expand-button {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 1rem;
    padding: 0.5rem 1rem;
    z-index: 1;
  }

  .expanded .expand-button {
    position: relative;
    left: 0;
    transform: none;
    width: fit-content;
    margin: 1rem auto 0 auto;
  }

  .fadeout-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 10rem;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, var(--color-background));
  }
</style>
