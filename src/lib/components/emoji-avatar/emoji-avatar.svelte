<script lang="ts">
  import twemoji from '$lib/utils/twemoji';
  import Question from '../icons/Question.svelte';

  export let emoji: string | undefined = undefined;
  export let color: string = 'var(--color-foreground-level-5';

  type Size = 'micro' | 'tiny' | 'small' | 'medium' | 'large' | 'huge';
  export let size: Size = 'small';

  const CONTAINER_SIZES: Record<Size, string> = {
    micro: '0.8rem',
    tiny: '1.5rem',
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    huge: '8rem',
  };
  $: containerSize = CONTAINER_SIZES[size];

  $: emojiElem = emoji ? twemoji(emoji) : undefined;
</script>

<div
  class="emoji-avatar"
  style="width: {containerSize}; height: {containerSize};"
  style:background-color={color}
>
  <div class="inner">
    {#if emoji}
      {@html emojiElem}
    {:else}
      <Question />
    {/if}
  </div>
</div>

<style>
  .emoji-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    user-select: none;
  }

  .inner {
    height: 60%;
    width: 60%;
  }
</style>
