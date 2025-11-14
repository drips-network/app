<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import { fade } from 'svelte/transition';

  interface Props {
    emoji?: string;
    headline?: string | undefined;
    text?: string | undefined;
  }

  let { emoji = '🫙', headline = 'Nothing to see here', text = 'Please add stuff to this section to see it here.' }: Props = $props();
</script>

<div class="notice empty-state" in:fade={{ duration: 250 }}>
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
