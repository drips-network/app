<script lang="ts">
  import Emoji from '$lib/components/emoji/Emoji.svelte';

  export let emoji: string | undefined = undefined;
  export let headline: string;
  export let description: string;
</script>

<div class="step-header">
  {#if emoji}<Emoji {emoji} size="huge" />{/if}
  <h1 class="typo-header-1">{headline}</h1>
  <p>{description}</p>
</div>

<style>
  .step-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  p {
    color: var(--color-foreground);
  }
</style>
