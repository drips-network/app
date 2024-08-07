<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import { fade, scale } from 'svelte/transition';
  import Spinner from '../spinner/spinner.svelte';
  import PaddedHorizontalScroll from '../padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import TransitionedHeight from '../transitioned-height/transitioned-height.svelte';

  export let loaded = false;
  export let empty = false;
  export let error = false;
  export let placeholderOutline = true;
  export let horizontalScroll = true;

  let highlit = false;

  export const highlightSection = () => {
    highlit = true;
    setTimeout(() => {
      highlit = false;
    }, 500);
  };

  export let collapsed = false;

  export let emptyStateEmoji = '👻';
  export let emptyStateHeadline: string | undefined = 'Nothing to see here';
  export let emptyStateText: string | undefined = undefined;

  let placeholderContainerElem: HTMLDivElement;

  let contentTransitonedIn = loaded;
</script>

<div class="section-skeleton">
  <TransitionedHeight transitionHeightChanges={!contentTransitonedIn} bind:collapsed>
    <div class="inner-wrapper">
      {#if !loaded || error || empty}
        <div
          out:fade={{ duration: 250 }}
          class="placeholder-container"
          bind:this={placeholderContainerElem}
          style:border={placeholderOutline ? '1px solid var(--color-foreground)' : ''}
        >
          {#if !loaded}
            <Spinner />
          {:else if error}
            <div class="notice" in:fade={{ duration: 250 }}>
              <Emoji emoji="⚠️" size="huge" />
              <div class="text-group">
                <p class="typo-text-small-bold">Oops, something went wrong.</p>
                <p class="typo-text-small">
                  Sorry, we werenʼt able to load this. There may be more information in the
                  developer console.
                </p>
                <a
                  class="typo-link typo-text-small"
                  target="_blank"
                  href="https://discord.gg/BakDKKDpHF">Ask for help</a
                >
              </div>
            </div>
          {:else if empty}
            <!-- Empty state -->
            <div class="notice" in:fade={{ duration: 250 }}>
              <Emoji emoji={emptyStateEmoji} size="huge" />
              <div class="text-group">
                {#if emptyStateHeadline}<p class="typo-text-small-bold">
                    {emptyStateHeadline}
                  </p>{/if}
                {#if emptyStateText}<p class="typo-text-small">{emptyStateText}</p>{/if}
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Actual content -->
        <!-- 
          Applying a negative margin matching the height of `placeholder-container` while it's still in the DOM
          to prevent an ugly transition glitch.
        -->
        <div
          class="content-container"
          style:margin-top={placeholderContainerElem ? '-16rem' : undefined}
          in:fade={{ duration: 250 }}
          on:transitionend={() => {
            contentTransitonedIn = true;
          }}
        >
          {#if horizontalScroll}
            <PaddedHorizontalScroll>
              <slot />
            </PaddedHorizontalScroll>
          {:else}
            <slot />
          {/if}
        </div>
      {/if}
    </div>
  </TransitionedHeight>
  {#if highlit}
    <div
      in:scale|global={{ duration: 300, start: 0.9 }}
      out:scale|global={{ duration: 300, start: 1.05 }}
      class="highlight-overlay"
    />
  {/if}
</div>

<style>
  .section-skeleton {
    position: relative;
    /* To give the PaddedHorizontalScroll some space */
    margin: 0 -2.5rem;
    height: fit-content;
  }

  .section-skeleton .inner-wrapper {
    padding: 0 2.5rem;
  }

  .placeholder-container {
    width: 100%;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-foreground);
    height: 16rem;
  }

  .notice {
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

  .highlight-overlay {
    position: absolute;
    top: -0.5rem;
    left: 2rem;
    right: 2rem;
    bottom: -0.5rem;
    background-color: var(--color-primary);
    opacity: 0.2;
    pointer-events: none;
    z-index: 1;
    border-radius: 1.25rem 0 1.25rem 1.25rem;
  }
</style>
