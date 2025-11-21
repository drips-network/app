<script lang="ts">
  import type { Component } from 'svelte';
  import { CUSTOM_EMOJI_COMPONENTS } from './emoji';
  import twemoji from '$lib/utils/twemoji';

  interface Props {
    emoji: string;
    size: 'small' | 'regular' | 'large' | 'huge' | 'massive';
  }

  let { emoji, size }: Props = $props();

  const SIZES_PX = {
    small: 12,
    regular: 16,
    large: 24,
    huge: 48,
    massive: 64,
  } as const;

  let sizePx = $derived(SIZES_PX[size]);

  let CustomEmoji: Component<{ size: number }> | undefined = $derived(
    CUSTOM_EMOJI_COMPONENTS[emoji],
  );
</script>

<div class="emoji">
  {#if CustomEmoji}
    <CustomEmoji size={sizePx}></CustomEmoji>
  {:else}
    {@html twemoji(emoji, {
      attributes: () => ({
        width: sizePx + 'px',
      }),
    })}
  {/if}
</div>

<style>
  .emoji {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
