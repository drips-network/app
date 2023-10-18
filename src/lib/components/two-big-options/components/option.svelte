<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import type { ComponentType } from 'svelte';

  export let selected: boolean;
  export let emoji: string;
  export let title: string;
  export let attributes: { icon: ComponentType; text: string }[] = [];
</script>

<button on:click class="option" class:selected role="radio" aria-checked={selected}>
  <div class="icon">
    <Emoji {emoji} size="huge" />
  </div>
  <h4 class="headline">
    {title}
  </h4>
  {#if attributes.length > 0}
    <div class="attributes">
      {#each attributes as attribute}
        <div class="attribute">
          <div class="icon">
            <svelte:component this={attribute.icon} style="fill: var(--color-foreground)" />
          </div>
          <div class="text">
            {attribute.text}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</button>

<style>
  .option {
    padding: 2rem 1rem;
    flex-shrink: 0;
    flex-grow: 1;
    flex-basis: 0px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    user-select: none;
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    box-shadow: none;
    transition: box-shadow 0.3s, background-color 0.3s;
    z-index: 1;
  }

  .option.selected {
    background-color: var(--color-primary-level-1);
  }

  .option:hover:not(.selected) {
    background-color: var(--color-foreground-level-1);
  }

  .option:focus-visible {
    box-shadow: 0px 0px 0px 2px var(--color-primary);
  }

  .attributes {
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .attributes .attribute {
    display: flex;
    gap: 0.25rem;
    text-align: left;
  }
</style>
