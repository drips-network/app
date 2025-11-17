<script lang="ts" module>
  import type { Component } from 'svelte';

  export type TDropdownOption = {
    icon?: Component;
    label: string;
  };

  export type TDropdownOptions = { [value: string]: TDropdownOption };
</script>

<script lang="ts" generics="TOptions extends TDropdownOptions">
  import { run } from 'svelte/legacy';

  import { fly } from 'svelte/transition';

  import Check from '$lib/components/icons/Check.svelte';
  import MiniButton from './mini-button.svelte';

  interface Props {
    icon: Component;
    options: TOptions;
    value?: keyof TOptions | null;
    label: string;
    allowNull?: boolean;
    open?: boolean;
    highlightIfSet?: boolean;
    disabled?: boolean;
    onOptionClick?:
      | ((key: keyof TOptions, selectFn: () => void, isSelected: boolean) => void)
      | undefined;
  }

  let {
    icon,
    options,
    value = $bindable(null),
    label,
    allowNull = false,
    open = $bindable(false),
    highlightIfSet = false,
    disabled = false,
    onOptionClick = undefined,
  }: Props = $props();

  function handleClick() {
    open = !open;
  }

  function selectFn(key: keyof TOptions) {
    if (allowNull && key === value) {
      value = null;
    } else {
      value = key;
    }

    open = false;
  }

  function handleOptionClick(key: keyof TOptions) {
    if (onOptionClick) {
      onOptionClick(key, () => selectFn(key), value === key);
      return;
    }

    selectFn(key);
  }

  let dropdownElem: HTMLUListElement | undefined = $state(undefined);
  let toggleButtonElem: HTMLButtonElement | undefined = $state(undefined);
  let dropdownPosition = $state({ top: 0, right: 0 });

  function updateDropdownPosition() {
    if (toggleButtonElem && typeof window !== 'undefined') {
      const rect = toggleButtonElem.getBoundingClientRect();
      dropdownPosition = {
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      };
    }
  }

  function handleWindowClick(event: MouseEvent) {
    if (
      dropdownElem &&
      toggleButtonElem &&
      !dropdownElem.contains(event.target as Node) &&
      !toggleButtonElem.contains(event.target as Node)
    ) {
      open = false;
    }
  }

  function handleWindowResize() {
    open = false;
  }

  run(() => {
    if (open && toggleButtonElem) {
      updateDropdownPosition();
    }
  });

  const ariaSlug = `mini-dropdown-${Math.random().toString(36).substring(2, 15)}`;
</script>

<svelte:window onclick={handleWindowClick} onresize={handleWindowResize} />

<div class="mini-dropdown" class:open class:highlight={highlightIfSet && value}>
  <button
    {disabled}
    id="select-button-{ariaSlug}"
    role="combobox"
    aria-controls="select-dropdown-{ariaSlug}"
    aria-expanded={open}
    onclick={handleClick}
    aria-label="Toggle dropdown"
    bind:this={toggleButtonElem}
  >
    <MiniButton
      label="Open {label} dropdown"
      highlight={Boolean(highlightIfSet && value)}
      {icon}
      {open}
    />
  </button>

  {#if open}
    <ul
      transition:fly={{ y: 4, duration: 200 }}
      class="dropdown"
      style="top: {dropdownPosition.top}px; right: {dropdownPosition.right}px;"
      role="listbox"
      id="select-dropdown-{ariaSlug}"
      aria-labelledby="select-button-{ariaSlug}"
      bind:this={dropdownElem}
    >
      {#each Object.entries(options) as [key, item]}
        <li
          role="option"
          aria-selected={value === key}
          class:selected={value === key}
          onclick={() => handleOptionClick(key)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleOptionClick(key);
            }
          }}
        >
          {#if item.icon}
            <item.icon style="fill: var(--color-foreground)" />
          {/if}

          <button>
            {item.label}
          </button>

          <div class="checkmark" style:opacity={value === key ? '1' : '0'}>
            <Check style="fill: var(--color-foreground)" />
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .mini-dropdown {
    position: relative;
    user-select: none;
  }

  button:disabled {
    opacity: 0.5;
  }

  .dropdown {
    position: fixed;
    background: var(--color-background);
    box-shadow: var(--elevation-medium);
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.5rem;
    z-index: 1000;
  }

  .dropdown li {
    display: flex;
    align-items: center;
    padding: 0.25rem;
    gap: 0.5rem;
    cursor: pointer;
    position: relative;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
  }

  .dropdown li:hover {
    background: var(--color-foreground-level-2);
  }

  .dropdown button {
    width: 100%;
    text-align: left;
  }
</style>
