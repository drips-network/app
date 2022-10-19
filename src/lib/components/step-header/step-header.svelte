<script lang="ts">
  import Emoji from 'radicle-design-system/Emoji.svelte';

  export let emoji: string;
  export let headline: string;
  export let description: string;
</script>

<div class="step-header">
  <Emoji {emoji} size="huge" />
  <h1>{headline}</h1>
  <p>{description}</p>
</div>

<style>
  .step-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }
</style>
