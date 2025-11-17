<script lang="ts" generics="T">
  import { run } from 'svelte/legacy';

  import { browser } from '$app/environment';
  import { createEventDispatcher } from 'svelte';

  type Option<V extends keyof T> = { title: string; value: V }[];

  interface Props {
    options: Option<keyof T>;
    active: keyof T;
    disabled?: boolean;
    containerRole?: string;
    itemRole?: string;
    ariaLabel?: string | undefined;
  }

  let {
    options,
    active = $bindable(),
    disabled = false,
    containerRole = 'radiogroup',
    itemRole = 'radio',
    ariaLabel = undefined,
  }: Props = $props();

  const dispatch = createEventDispatcher<{ select: keyof T }>();

  let optionElems: Partial<{ [key in keyof T]: HTMLDivElement }> = $state({});

  let selectorWidth = $state<number>();
  let selectorOffset = $state<number>();

  let transition = $state(false);

  function updateSelector(shouldTransition = false) {
    transition = shouldTransition;

    selectorOffset = (optionElems[active]?.offsetLeft ?? 4) - 4;
    selectorWidth = optionElems[active]?.offsetWidth ?? 0;
  }

  run(() => {
    active && updateSelector(true);
  });

  let containerElem: HTMLDivElement | undefined = $state();
  let containerResizeObserver = browser ? new ResizeObserver(() => updateSelector()) : undefined;
  run(() => {
    containerElem && containerResizeObserver?.observe(containerElem);
  });

  run(() => {
    dispatch('select', active);
  });

  function handleKeydown(e: KeyboardEvent, option: keyof T) {
    const selectKeys = ['Enter', ' '];
    if (!selectKeys.includes(e.key)) return;

    active = option;

    e.preventDefault();
  }
</script>

<div class="segmented-control" class:disabled bind:this={containerElem}>
  <div class="options" role={containerRole} aria-label={ariaLabel}>
    {#each options as option}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div
        role={itemRole}
        aria-checked={active === option.value}
        class="option typo-text"
        bind:this={optionElems[option.value]}
        class:selected={active === option.value}
        tabindex="0"
        onclick={() => (active = option.value)}
        onkeydown={(e) => handleKeydown(e, option.value)}
        id={String(option.value)}
      >
        <label for={String(option.value)}>{option.title}</label>
        <div class="background"></div>
      </div>
    {/each}
  </div>
  <div
    class="selector"
    class:transition
    class:at-beginning={options.findIndex((o) => o.value === active) === 0}
    class:at-end={options.findIndex((o) => o.value === active) === options.length - 1}
    style="transform: translateX({selectorOffset}px); width: {selectorWidth}px;"
  ></div>
</div>

<style>
  .segmented-control {
    position: relative;
    border: 1px solid var(--color-foreground-level-3);
    padding: 0.25rem;
    border-radius: 2rem 0 2rem 2rem;
    z-index: 0;
    user-select: none;
    background-color: var(--color-background);
    transition: opacity 0.3s;
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
  }

  .selector.transition {
    transition:
      transform 0.3s,
      width 0.3s,
      border-radius 0.3s;
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

  .segmented-control.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
