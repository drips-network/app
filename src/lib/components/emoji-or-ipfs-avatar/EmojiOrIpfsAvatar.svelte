<script lang="ts">
  import twemoji from '$lib/utils/twemoji';
  import { onMount, type ComponentType } from 'svelte';
  import Question from '../icons/Question.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import { fade } from 'svelte/transition';

  export let emoji: string | undefined = undefined;
  export let ipfsCid: string | undefined = undefined;

  /** If set, displays placeholder intead of real avatar. */
  export let placeholderIcon: ComponentType | undefined = undefined;

  type Size = 'micro' | 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | 'huge';
  export let size: Size = 'small';

  $: outline = Boolean(ipfsCid || emoji);

  const CONTAINER_SIZES: Record<Size, string> = {
    micro: '0.8rem',
    tiny: '1.5rem',
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    xlarge: '6.5rem',
    huge: '8rem',
  };
  $: containerSize = CONTAINER_SIZES[size];

  $: emojiElem = emoji ? twemoji(emoji) : undefined;

  let customImageEl: HTMLImageElement | undefined = undefined;
  let customImageLoading = false;
  let prevAvatarCid: string | undefined = undefined;
  $: {
    if (ipfsCid && ipfsCid !== prevAvatarCid) {
      customImageLoading = true;
      prevAvatarCid = ipfsCid;
    }
  }

  onMount(async () => {
    if (customImageEl && customImageEl.complete) {
      customImageLoading = false;
    }
  });
</script>

<div
  class="wrapper"
  style="width: {containerSize}; height: {containerSize};"
  style:background-color={outline ? 'var(--color-primary)' : 'var(--color-foreground-level-2)'}
  class:with-outline={outline}
>
  {#if customImageLoading}
    <div class="loading-state" transition:fade={{ duration: 300 }}>
      <Spinner />
    </div>
  {/if}

  {#if ipfsCid}
    <img
      bind:this={customImageEl}
      on:load={() => (customImageLoading = false)}
      src="/api/custom-avatars/{ipfsCid}"
      alt="project avatar"
      style:height="100%"
    />
  {:else if emoji}
    <div class="emoji-wrapper">
      {@html emojiElem}
    </div>
  {:else if placeholderIcon}
    <svelte:component
      this={placeholderIcon}
      style="width: min(80%, 3rem); height: min(80%, 3rem)"
    />
  {:else}
    <Question style="width: min(80%, 3rem); height: min(80%, 3rem)" />
  {/if}
</div>

<style>
  .wrapper {
    overflow: hidden;
    user-select: none;
    position: relative;
    flex-shrink: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-state {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: grid;
    place-items: center;
    background-color: var(--color-foreground-level-2);
  }

  .emoji-wrapper {
    height: 60%;
    width: 60%;
  }

  .with-outline {
    border: 1px solid var(--color-foreground-level-6);
  }
</style>
