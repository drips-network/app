<script lang="ts">
  import Emoji from '$lib/components/emoji/Emoji.svelte';
  import Button from '../button/button.svelte';

  export let emoji: string;
  export let headline: string;
  export let description: string | undefined;
  export let button: { label: string; handler: () => void } | undefined = undefined;
</script>

<div class="large-empty-state">
  <Emoji size="huge" {emoji} />
  <div class="content">
    <h1 class="typo-header-1">{headline}</h1>
    {#if description}<p>{description}</p>{/if}
    {#if button}<Button on:click={button.handler}>{button.label}</Button>{/if}
  </div>
</div>

<style>
  .large-empty-state {
    user-select: none;
    height: 100%;
    padding: 30vh 0;
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-direction: column;
    align-items: center;
  }

  .content {
    display: flex;
    text-align: center;
    max-width: 32rem;
    gap: 1rem;
    align-items: center;
    flex-direction: column;
  }

  p {
    color: var(--color-foreground-level-6);
  }
</style>
