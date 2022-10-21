<script lang="ts">
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import { fade } from 'svelte/transition';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { tick } from 'svelte';
  import Spinner from '../spinner/spinner.svelte';

  export let loaded = false;
  export let empty = true;
  export let error = false;

  export let emptyStateEmoji = '👻';
  export let emptyStateHeadline: string | undefined = 'Nothing to see here';
  export let emptyStateText: string | undefined = undefined;

  let containerHeight = tweened(256, {
    duration: 300,
    easing: cubicInOut,
  });

  let placeholderContainerPosition = 'absolute';

  let contentContainerElem: HTMLDivElement;

  $: {
    if (loaded && !empty) {
      updateContainerHeight();
    }
  }

  async function updateContainerHeight() {
    await tick();

    const newHeight = contentContainerElem.getBoundingClientRect().height;
    containerHeight.set(newHeight);
  }
</script>

<div class="section-skeleton" style:height={`${$containerHeight}px`}>
  {#if loaded}
    {#if empty}
      <div
        in:fade={{ duration: 250 }}
        class="placeholder-container"
        style:height={`${$containerHeight}px`}
        style:position={placeholderContainerPosition}
      >
        <div class="empty-state">
          <Emoji emoji={emptyStateEmoji} size="large" />
          <div class="text-group">
            {#if emptyStateHeadline}<p class="typo-text-small-bold">{emptyStateHeadline}</p>{/if}
            {#if emptyStateText}<p class="typo-text-small">{emptyStateText}</p>{/if}
          </div>
        </div>
      </div>
    {:else if error}
      <div class="empty-state">
        <Emoji emoji="⚠️" size="large" />
        <div class="text-group">
          <p class="typo-text-small-bold">Oops, something went wrong.</p>
          <p class="typo-text-small">
            Sorry, we weren't able to load this. There may be more information in the developer
            console.
          </p>
          <a class="typo-text-small" href="wikipedia.com">Ask for help</a>
        </div>
      </div>
    {:else}
      <div bind:this={contentContainerElem} class="content-container" in:fade={{ duration: 250 }}>
        <slot />
      </div>
    {/if}
  {:else}
    <div
      out:fade|local={{ duration: 250 }}
      style:position={placeholderContainerPosition}
      class="placeholder-container"
      style:height={`${$containerHeight}px`}
    >
      <Spinner />
    </div>
  {/if}
</div>

<style>
  .section-skeleton {
    position: relative;
  }

  .placeholder-container {
    width: 100%;
    border: 2px solid var(--color-foreground-level-1);
    border-radius: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-foreground-level-4);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 16rem;
    text-align: center;
  }

  .text-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
