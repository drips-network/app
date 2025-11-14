<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import { fade, scale } from 'svelte/transition';
  import Spinner from '../spinner/spinner.svelte';
  import PaddedHorizontalScroll from '../padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import TransitionedHeight from '../transitioned-height/transitioned-height.svelte';
  import EmptyState from './empty-state.svelte';
  import DisconnectedState from './disconnected-state.svelte';
  import type { ComponentProps } from 'svelte';
  import Button from '../button/button.svelte';

  export let loaded = false;
  export let empty = false;
  export let disconnected = false;
  export let error = false;
  export let placeholderOutline = true;
  export let horizontalScroll = true;
  export let overflowAction: (ComponentProps<Button> & { label: string }) | undefined = undefined;

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

  export let disconnectedStateEmoji: string | undefined = '🫙';
  export let disconnectedStateHeadline: string | undefined = 'You are disconnected';
  export let disconnectedStateText: string | undefined = undefined;

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
          style:border={placeholderOutline ? '1px solid var(--color-foreground-level-3)' : ''}
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
          {:else if disconnected}
            <DisconnectedState
              emoji={disconnectedStateEmoji}
              headline={disconnectedStateHeadline}
              text={disconnectedStateText}
            />
          {:else if empty}
            <!-- Empty state -->
            <EmptyState
              emoji={emptyStateEmoji}
              headline={emptyStateHeadline}
              text={emptyStateText}
            />
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

        {#if overflowAction}
          <div class="overflow-action">
            <div style:pointer-events="auto">
              <Button {...overflowAction}>{overflowAction.label}</Button>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </TransitionedHeight>
  {#if highlit}
    <div
      in:scale={{ duration: 300, start: 0.9 }}
      out:scale={{ duration: 300, start: 1.05 }}
      class="highlight-overlay"
   ></div>
  {/if}
</div>

<style>
  .section-skeleton {
    position: relative;
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

  .overflow-action {
    pointer-events: none;
    position: absolute;
    left: 2.5rem;
    right: 2.5rem;
    bottom: -1rem;
    height: 8rem;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0),
      var(--color-background) 79%,
      var(--color-background)
    );
  }

  @media (max-width: 577px) {
    .section-skeleton {
      margin: 0 -1rem;
    }

    .section-skeleton .inner-wrapper {
      padding: 0 1rem;
    }

    .overflow-action {
      left: 1rem;
      right: 1rem;
    }
  }
</style>
