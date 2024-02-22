<script lang="ts">
  type EmojiSize = 'small' | 'regular' | 'large' | 'huge' | 'massive';

  import twemoji from 'twemoji';

  import { writable } from 'svelte/store';
  const config = writable({
    assetPathPrefix: '', // Set this to "/" for an absolute asset path.
  });

  export let emoji: string;
  export let size: EmojiSize = 'regular';
  export let style: string | undefined = undefined;
</script>

<div {style} class="container">
  {@html twemoji.parse(emoji, {
    className: `emoji ${size}`,
    base: $config.assetPathPrefix,
    folder: '/twemoji',
    ext: '.svg',
  })}
</div>

<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.emoji.small) {
    height: 0.75rem;
    width: 0.75rem;
  }

  :global(.emoji.regular) {
    height: 1rem;
    width: 1rem;
  }

  :global(.emoji.large) {
    height: 2rem;
    width: 2rem;
  }

  :global(.emoji.huge) {
    height: 3rem;
    width: 3rem;
  }

  :global(.emoji.massive) {
    height: 4rem;
    width: 4rem;
  }
</style>
