<script lang="ts">
  import type { ComponentType } from 'svelte';
  import Option from './components/option.svelte';

  interface OptionConfig {
    emoji: string;
    title: string;
    attributes: { icon: ComponentType; text: string }[];
  }

  export let option1: OptionConfig;
  export let option2: OptionConfig;

  export let selected: 1 | 2 | undefined = undefined;
</script>

<div class="options" role="radiogroup">
  <Option on:click={() => (selected = 1)} selected={selected === 1} {...option1} />
  <div class="divider" class:not-visible={selected !== undefined} />
  <Option on:click={() => (selected = 2)} selected={selected === 2} {...option2} />
</div>

<style>
  .options {
    display: flex;
    border: 1px solid var(--color-foreground);
    border-radius: 2rem 0 2rem 2rem;
    padding: 0.5rem;
    align-items: stretch;
    position: relative;
    gap: 1rem;
  }

  .divider {
    width: 1px;
    background-color: var(--color-foreground);
    transition: opacity 0.3s;
  }

  .divider.not-visible {
    opacity: 0;
  }

  @media (max-width: 577px) {
    .options {
      flex-direction: column;
    }

    .divider {
      width: 100%;
      height: 1px;
    }
  }
</style>
