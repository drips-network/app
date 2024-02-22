<script lang="ts">
  import DesignSystemEmoji from './emoji-radicle-system.svelte';
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
    <DesignSystemEmoji {emoji} {size} />
  {/if}
</div>

<style>
  .emoji {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
