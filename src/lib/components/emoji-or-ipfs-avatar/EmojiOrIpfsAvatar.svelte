<script lang="ts">
  import { run } from 'svelte/legacy';

  import twemoji from '$lib/utils/twemoji';
  import { onMount, type Component } from 'svelte';
  import Question from '../icons/Question.svelte';
  import Spinner from '../spinner/spinner.svelte';  

  type Size = 'micro' | 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | 'huge';
  interface Props {
    emoji?: string | undefined;
    ipfsCid?: string | undefined;
    /** If set, displays placeholder intead of real avatar. */
    placeholderIcon?: Component | undefined;
    size?: Size;
  }

  let {
    emoji = undefined,
    ipfsCid = undefined,
    placeholderIcon = undefined,
    size = 'small'
  }: Props = $props();

  let outline = $derived(Boolean(ipfsCid || emoji));

  const CONTAINER_SIZES: Record<Size, string> = {
    micro: '0.8rem',
    tiny: '1.5rem',
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    xlarge: '6.5rem',
    huge: '8rem',
  };
  let containerSize = $derived(CONTAINER_SIZES[size]);

  const IMAGE_SIZES = {
    micro: 32,
    tiny: 48,
    small: 64,
    medium: 96,
    large: 128,
    xlarge: 192,
    huge: 256,
  };
  let imageSize = $derived(IMAGE_SIZES[size]);

  let emojiElem = $derived(emoji ? twemoji(emoji) : undefined);

  let customImageEl: HTMLImageElement | undefined = $state(undefined);
  let customImageLoading = $state(false);
  let prevAvatarCid: string | undefined = $state(undefined);
  run(() => {
    if (ipfsCid && ipfsCid !== prevAvatarCid) {
      customImageLoading = true;
      prevAvatarCid = ipfsCid;
    }
  });

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
  <div class="loading-state" class:visible={customImageLoading}>
    <Spinner />
  </div>

  {#if ipfsCid}
    <img
      bind:this={customImageEl}
      onload={() => (customImageLoading = false)}
      src="/api/custom-avatars/{ipfsCid}?size={imageSize}"
      alt="project avatar"
      style:height="100%"
    />
  {:else if emoji}
    <div class="emoji-wrapper">
      {@html emojiElem}
    </div>
  {:else if placeholderIcon}
    {@const SvelteComponent = placeholderIcon}
    <SvelteComponent
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
    opacity: 0;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: grid;
    place-items: center;
    background-color: var(--color-foreground-level-2);
    transition: opacity 0.3s;
  }

  .loading-state.visible {
    opacity: 1;
  }

  .emoji-wrapper {
    height: 60%;
    width: 60%;
  }

  .with-outline {
    border: 1px solid var(--color-foreground-level-6);
  }
</style>
