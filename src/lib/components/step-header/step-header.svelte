<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    emoji?: string | undefined;
    headline?: string | undefined;
    description?: string | undefined;
    emojiSlot?: Snippet;
  }

  let {
    emojiSlot,
    emoji = undefined,
    headline = undefined,
    description = undefined,
  }: Props = $props();
</script>

<div class="step-header">
  {@render emojiSlot?.()}
  {#if emoji}<Emoji {emoji} size="huge" />{/if}
  {#if headline}<h1>{headline}</h1>{/if}
  {#if description}<p>{description}</p>{/if}
</div>

<style>
  .step-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    user-select: none;
  }

  p {
    color: var(--color-foreground);
  }
</style>
