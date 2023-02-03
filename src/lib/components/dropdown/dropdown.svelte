<script lang="ts">
  import modal from '$lib/stores/modal';
  import ChevronDown from 'radicle-design-system/icons/ChevronDown.svelte';
  import { fly, scale } from 'svelte/transition';
  import FocusTrap from '../focus-trap/focus-trap.svelte';
  import { Focus, focusIn } from '../focus-trap/methods/focus';
  import Toggle from '../toggle/toggle.svelte';

  interface Option {
    value: string;
    title: string;
    iconUrl?: string;
  }

  export let disabled = false;
  export let value: string;
  export let toggleValue = false;
  export let noBorder = false;
  export let options: Option[];
  export let dropdownWidth: { pixels: number; align: 'left' | 'right' } | undefined = undefined;
  export let toggle: { label: string } | undefined = undefined;

  $: selectedOptionIndex = options.findIndex((o) => o.value === value);
  $: selectedOption = options[selectedOptionIndex];

  let wrapperElem: HTMLDivElement;
  let dropdownElem: HTMLDivElement;
  let optionsElem: HTMLDivElement;
  let optionElems: HTMLDivElement[] = [];

  let expanded = false;

  async function setExpanded(val: boolean) {
    modal.setFocusTrapped(!val);
    modal.setHideable(!val);

    expanded = val;
  }

  async function select(option: Option) {
    value = option.value;
    setExpanded(false);
    dropdownElem.focus();
  }

  function handleWrapperClick() {
    setExpanded(!expanded);
  }

  function handleDropdownKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      setExpanded(true);
      e.preventDefault();
    }
  }

  function handleOptionKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      (e.target as HTMLDivElement).click();
      e.preventDefault();
    }
  }

  async function handleWindowKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && expanded) {
      e.preventDefault();
      setExpanded(false);
      dropdownElem.focus();
    }

    if (e.key === 'ArrowUp' && expanded) {
      focusIn(optionsElem, Focus.Previous);
      e.preventDefault();
    }

    if (e.key === 'ArrowDown' && expanded) {
      focusIn(optionsElem, Focus.Next);
      e.preventDefault();
    }
  }

  function handleWindowClick(e: MouseEvent) {
    if (!(e.target instanceof HTMLElement) || !wrapperElem.contains(e.target)) setExpanded(false);
  }
</script>

<svelte:window on:keydown={handleWindowKeydown} on:click={handleWindowClick} />

<div class="wrapper typo-text-bold" bind:this={wrapperElem}>
  <div
    role="listbox"
    aria-multiselectable="false"
    class="dropdown"
    class:no-border={noBorder}
    class:expanded
    class:disabled
    tabindex={disabled ? -1 : 0}
    bind:this={dropdownElem}
    on:keydown={disabled ? undefined : handleDropdownKeydown}
    on:click={disabled ? undefined : handleWrapperClick}
    data-testid="dropdown"
  >
    {#if selectedOption.iconUrl}<img
        src={selectedOption.iconUrl}
        alt="{selectedOption.title} icon"
      />{/if}
    <div class="title" data-testid="title-field">
      {#key selectedOption.title}
        <span
          class="value"
          in:fly|local={{ y: 10, duration: 200 }}
          out:fly|local={{ y: -10, duration: 200 }}
        >
          {selectedOption.title}
        </span>
      {/key}
      <span class="placeholder">
        {selectedOption.title}
      </span>
    </div>
    <div class="chevron" class:expanded><ChevronDown /></div>
  </div>

  {#if expanded}
    <div
      transition:scale|local={{ start: 0.95, duration: 200 }}
      class="options"
      class:expanded
      class:left={dropdownWidth?.align === 'left'}
      class:right={dropdownWidth?.align === 'right'}
      style:width={dropdownWidth ? `${dropdownWidth?.pixels}px` : '100%'}
      bind:this={optionsElem}
      data-testid="options"
    >
      {#if toggle}
        <div class="toggle">
          <Toggle label={toggle.label} bind:checked={toggleValue} />
        </div>
      {/if}
      {#each options as option, index}
        <div
          class="option"
          role="option"
          aria-selected={selectedOptionIndex === index}
          tabindex="0"
          data-testid="option-{option.value}"
          on:click={() => select(option)}
          on:keydown={handleOptionKeydown}
          bind:this={optionElems[index]}
        >
          {#if option.iconUrl}<img src={option.iconUrl} alt="{option.title} icon" />{/if}
          <span class="title">{option.title}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if optionsElem}
  <FocusTrap
    enabled={optionElems.length > 0}
    containers={new Set([optionsElem])}
    options={{ initialFocus: optionElems[selectedOptionIndex] }}
  />
{/if}

<style>
  .wrapper {
    width: 100%;
  }

  .dropdown {
    height: 2.5rem;
    padding: 0.5rem 2.5rem 0.5rem 0.75rem;
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground);
    border-radius: 1.25rem 0 1.25rem 1.25rem;
    transition: border-radius 0.2s, box-shadow 0.3s, background-color 0.3s;
    cursor: pointer;
    outline: none;
    cursor: pointer;
    user-select: none;
    display: flex;
    gap: 0.25rem;
  }

  .dropdown.disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .dropdown.no-border:not(.expanded) {
    box-shadow: none;
  }

  .dropdown > .title {
    position: relative;
  }

  .dropdown > .title > .value {
    position: absolute;
    left: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .dropdown > .title > .placeholder {
    opacity: 0;
    pointer-events: none;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .dropdown.expanded {
    border-radius: 1.25rem 0 0.25rem 0.25rem;
  }

  .dropdown:hover,
  .dropdown:active {
    box-shadow: inset 0px 0px 0px 2px var(--color-foreground);
    background-color: var(--color-foreground-level-1);
  }

  .dropdown:focus {
    box-shadow: inset 0px 0px 0px 2px var(--color-foreground);
  }

  .wrapper {
    position: relative;
  }

  .chevron {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    transition: transform 0.3s;
    pointer-events: none;
  }

  .chevron.expanded {
    transform: rotate3d(1, 0, 0, 180deg);
  }

  .options {
    border: 1px solid var(--color-foreground);
    border-radius: 1.25rem;
    position: absolute;
    top: 3rem;
    background-color: var(--color-background);
    z-index: 10;
    display: flex;
    flex-direction: column;
    overflow: scroll;
    margin-bottom: 1rem;
    transition: border-radius 0.3s;
    user-select: none;
  }

  .options.expanded {
    border-radius: 0.25rem 0.25rem 1.25rem 1.25rem;
  }

  .options.expanded.left {
    left: 0;
    border-radius: 0.25rem 0 1.25rem 1.25rem;
  }

  .options.expanded.right {
    right: 0;
    border-radius: 1.25rem 0.25rem 1.25rem 1.25rem;
  }

  .options > .toggle {
    padding: 0.75rem 0.75rem;
    border-bottom: 1px solid var(--color-foreground);
  }

  .options > .option {
    padding: 0.5rem 0.75rem;
    transition: background-color 0.2s;
    outline: none;
    cursor: pointer;
    text-align: left;
    display: flex;
    gap: 0.5rem;
  }

  .options > .option > .title {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  img {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 1.25rem;
  }

  .options > .option:hover {
    background-color: var(--color-foreground-level-1);
  }

  .options > .option:focus {
    background-color: var(--color-foreground-level-2);
  }
</style>
