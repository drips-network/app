<script lang="ts">
  import type { Component } from 'svelte';
  import Option from './components/option.svelte';

  interface OptionConfig {
    emoji: string;
    title: string;
    attributes: { icon: Component; text: string }[];
  }

  interface Props {
    option1: OptionConfig;
    option2: OptionConfig;
    selected?: 1 | 2 | undefined;
  }

  let { option1, option2, selected = $bindable() }: Props = $props();
</script>

<div class="options" role="radiogroup">
  <Option onclick={() => (selected = 1)} selected={selected === 1} {...option1} />
  <div class="divider"></div>
  <Option onclick={() => (selected = 2)} selected={selected === 2} {...option2} />
</div>

<style>
  .options {
    display: flex;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 2rem 0 2rem 2rem;
    padding: 0.5rem;
    align-items: stretch;
    position: relative;
    gap: 0.5rem;
  }

  .divider {
    width: 1px;
    background-color: var(--color-foreground);
    transition: opacity 0.3s;
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
