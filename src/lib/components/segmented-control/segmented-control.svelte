<script lang="ts">
  import { browser } from '$app/environment';
  import { createEventDispatcher, onMount, tick } from 'svelte';

  type T = $$Generic;
  type Option<V extends keyof T> = { title: string; value: V }[];

  export let options: Option<keyof T>;
  export let active: keyof T;

  const dispatch = createEventDispatcher<{ select: keyof T }>();

  let optionElems: Partial<{ [key in keyof T]: HTMLDivElement }> = {};

  let selectorWidth: number;
  let selectorOffset: number;

  let initialRender = true;

  async function updateSelector() {
    selectorOffset = (optionElems[active]?.offsetLeft ?? 4) - 4;
    selectorWidth = optionElems[active]?.offsetWidth ?? 0;

    await tick();

    initialRender = false;
  }

  onMount(async () => {
    updateSelector();
  });

  $: active && updateSelector();

  let containerElem: HTMLDivElement | undefined;
  let containerResizeObserver = browser ? new ResizeObserver(updateSelector) : undefined;
  $: containerElem && containerResizeObserver?.observe(containerElem);

  $: dispatch('select', active);

  function handleKeydown(e: KeyboardEvent, option: keyof T) {
    const selectKeys = ['Enter', ' '];
    if (!selectKeys.includes(e.key)) return;

    active = option;

    e.preventDefault();
  }
</script>

<div class="segmented-control" bind:this={containerElem}>
  <div class="options">
    {#each options as option}
      <div
        role="radio"
        aria-checked={active === option.value}
        class="option typo-text"
        bind:this={optionElems[option.value]}
        class:selected={active === option.value}
        tabindex="0"
        on:click={() => (active = option.value)}
        on:keydown={(e) => handleKeydown(e, option.value)}
        id={String(option.value)}
      >
        <label for={String(option.value)}>{option.title}</label>
        <div class="background" />
      </div>
    {/each}
  </div>
  <div
    class="selector"
    class:initial-render={initialRender}
    class:at-beginning={options.findIndex((o) => o.value === active) === 0}
    class:at-end={options.findIndex((o) => o.value === active) === options.length - 1}
    style="transform: translateX({selectorOffset}px); width: {selectorWidth}px;"
  />
</div>

<style>
  .segmented-control {
    position: relative;
    border: 1px solid var(--color-foreground);
    padding: 0.25rem;
    border-radius: 2rem 0 2rem 2rem;
    z-index: 0;
    user-select: none;
  }

  .segmented-control .options {
    display: flex;
    gap: 0.25rem;
  }

  .option {
    position: relative;
    transition: all 0.3s;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
  }

  .option * {
    cursor: pointer;
  }

  .option.selected {
    color: white;
  }

  .selector {
    z-index: -1;
    background-color: var(--color-primary);
    position: absolute;
    top: 0.25rem;
    bottom: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.3s;
  }

  .selector.initial-render {
    transition: none;
  }

  .selector.at-beginning {
    border-radius: 1rem 0.25rem 0.25rem 1rem;
  }

  .selector.at-end {
    border-radius: 0.25rem 0 1rem 0.25rem;
  }

  .option .background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-foreground-level-1);
    border-radius: 0.25rem;
    z-index: -2;
    transition: background-color 0.3s;
  }

  .option:focus-visible {
    outline: none;
  }

  .option:hover .background,
  .option:focus .background {
    background-color: var(--color-primary-level-2);
    outline: none;
  }

  .option:first-child .background {
    border-radius: 1rem 0.25rem 0.25rem 1rem;
  }

  .option:last-child .background {
    border-radius: 0.25rem 0 1rem 0.25rem;
  }
</style>
