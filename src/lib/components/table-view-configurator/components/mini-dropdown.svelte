<script lang="ts" context="module">
  import type { ComponentType } from 'svelte';

  export type TDropdownOption = {
    icon?: ComponentType;
    label: string;
  };

  export type TDropdownOptions = { [value: string]: TDropdownOption };
</script>

<script lang="ts" generics="TOptions extends TDropdownOptions">
  import { fly } from 'svelte/transition';

  import Check from '$lib/components/icons/Check.svelte';
  import MiniButton from './mini-button.svelte';

  export let icon: ComponentType;

  export let options: TOptions;
  export let value: keyof TOptions | null = null;

  export let label: string;

  export let allowNull = false;

  export let open = false;

  export let highlightIfSet = false;

  export let disabled = false;

  export let onOptionClick: ((key: keyof TOptions, selectFn: () => void) => void) | undefined =
    undefined;

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
      onOptionClick(key, () => selectFn(key));
      return;
    }

    selectFn(key);
  }

  let dropdownElem: HTMLUListElement | undefined = undefined;
  let toggleButtonElem: HTMLButtonElement | undefined = undefined;

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

  const ariaSlug = `mini-dropdown-${Math.random().toString(36).substring(2, 15)}`;
</script>

<svelte:window on:click={handleWindowClick} />

<div class="mini-dropdown" class:open class:highlight={highlightIfSet && value}>
  <button
    {disabled}
    id="select-button-{ariaSlug}"
    role="combobox"
    aria-controls="select-dropdown-{ariaSlug}"
    aria-expanded={open}
    on:click={handleClick}
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
      role="listbox"
      id="select-dropdown-{ariaSlug}"
      aria-labelledby="select-button-{ariaSlug}"
      bind:this={dropdownElem}
    >
      {#each Object.entries(options).filter((v) => v[1]) as [key, item]}
        <li
          role="option"
          aria-selected={value === key}
          class:selected={value === key}
          on:click={() => handleOptionClick(key)}
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleOptionClick(key);
            }
          }}
        >
          {#if item.icon}
            <svelte:component this={item.icon} style="fill: var(--color-foreground)" />
          {/if}

          <button>
            {item.label}
          </button>

          <div class="checkmark" style:opacity={value === key ? '1' : '0'}><Check /></div>
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
    position: absolute;
    top: 2.5rem;
    right: 0;
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
