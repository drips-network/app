<script lang="ts" generics="OT extends { label: string; value: string }[]">
  import type { SingleSelectConfig } from '../types';

  interface Props {
    config: SingleSelectConfig<OT>;
    selected: OT[number]['value'] | undefined;
    onchange: (value: OT[number]['value'] | null) => void;
  }

  let { config, onchange, selected = $bindable(undefined) }: Props = $props();

  export function clear() {
    selected = undefined;
  }

  function handleSelect(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    e.preventDefault();

    const { value } = e.currentTarget;

    const alreadyChecked = selected === value;

    selected = alreadyChecked ? undefined : value;
    onchange(selected ?? null);
  }
</script>

<div class="single-select-filter-item">
  {#each config.options as { label, value }}
    <label for={label} class:selected={selected === value}>{label}</label>
    <input
      onchange={(e) => handleSelect(e)}
      checked={selected === value}
      id={label}
      type="checkbox"
      name={config.label}
      {value}
    />
  {/each}
</div>

<style>
  label {
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-foreground-level-3);
    user-select: none;
  }

  label.selected {
    background-color: var(--color-primary-level-1);
    border-color: var(--color-primary-level-3);
  }

  input {
    display: none;
  }
</style>
