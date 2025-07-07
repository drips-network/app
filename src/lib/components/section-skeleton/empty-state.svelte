<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import { fade } from 'svelte/transition';

  export let emoji: string = '🫙';
  export let headline: string | undefined = 'Nothing to see here';
  export let text: string | undefined = 'Please add stuff to this section to see it here.';
</script>

<div class="notice" in:fade={{ duration: 250 }}>
  <Emoji {emoji} size="huge" />
  <div class="text-group">
    {#if headline}<p class="typo-text-small-bold">
        {headline}
      </p>{/if}
    {#if text}<p class="typo-text-small">{text}</p>{/if}
  </div>
</div>

<style>
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
</style>
