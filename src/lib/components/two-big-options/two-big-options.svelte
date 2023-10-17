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

  /** If undefined, selector is hidden. If string, defines offset (horizontal on desktop, vertical mobile). */
  let selectorOffset: string | undefined;
  $: {
    if (selected === 2) {
      selectorOffset = 'calc(100% + 2rem)';
    } else if (selected === 1) {
      selectorOffset = '0';
    } else {
      selectorOffset = undefined;
    }
  }
</script>

<div class="options" role="radiogroup">
  <div
    class="selector desktop"
    class:visible={selected !== undefined}
    style:transform="translateX({selectorOffset})"
  />
  <div
    class="selector mobile"
    class:visible={selected !== undefined}
    style:transform="translateY({selectorOffset})"
  />
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

  .selector {
    position: absolute;
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    top: 0.5rem;
    left: 0.5rem;
    background-color: var(--color-primary-level-1);
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
    pointer-events: none;
  }

  .selector.desktop {
    height: calc(100% - 1rem);
    width: calc(50% - 1.5rem);
  }

  .selector.mobile {
    height: calc(50% - 1.5rem);
    width: calc(100% - 1rem);
    display: none;
  }

  .selector.visible {
    opacity: 1;
  }

  @media (max-width: 577px) {
    .options {
      flex-direction: column;
    }

    .selector.mobile {
      display: initial;
    }

    .selector.desktop {
      display: none;
    }

    .divider {
      width: 100%;
      height: 1px;
    }
  }
</style>
