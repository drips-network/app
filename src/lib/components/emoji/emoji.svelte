<script lang="ts">
  import twemoji from 'twemoji';
  import type { ComponentType } from 'svelte';
  import { CUSTOM_EMOJI_COMPONENTS } from './emoji';

  export let emoji: string;
  export let size: 'small' | 'regular' | 'large' | 'huge' | 'massive';

  const SIZES_PX = {
    small: 12,
    regular: 16,
    large: 24,
    huge: 48,
    massive: 64,
  } as const;

  $: sizePx = SIZES_PX[size];

  let customEmoji: ComponentType | undefined;
  $: customEmoji = CUSTOM_EMOJI_COMPONENTS[emoji];
</script>

<div class="emoji">
  {#if customEmoji}
    <svelte:component this={customEmoji} size={sizePx} />
  {:else}
    {@html twemoji.parse(emoji, {
      className: `twemoji ${size}`,
      base: '',
      folder: '/twemoji',
      ext: '.svg',
    })}
  {/if}
</div>

<style>
  .emoji {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.twemoji.small) {
    height: 0.75rem;
    width: 0.75rem;
  }

  :global(.twemoji.regular) {
    height: 1rem;
    width: 1rem;
  }

  :global(.twemoji.large) {
    height: 2rem;
    width: 2rem;
  }

  :global(.twemoji.huge) {
    height: 3rem;
    width: 3rem;
  }

  :global(.twemoji.massive) {
    height: 4rem;
    width: 4rem;
  }
</style>
