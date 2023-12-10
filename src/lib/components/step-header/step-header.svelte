<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';

  export let emoji: string | undefined = undefined;
  export let headline: string;
  export let description: string | undefined = undefined;
</script>

<div class="step-header">
  {#if emoji}<Emoji {emoji} size="huge" />{/if}
  <h1>{headline}</h1>
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
