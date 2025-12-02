<script lang="ts">
  import SelectedDot from '../selected-dot/selected-dot.svelte';

  interface Props {
    checked: boolean;
    label?: string | undefined;
    size?: 'normal' | 'big';
    onclick?: ((e: MouseEvent) => void) | undefined;
    oninput?: ((event: Event) => void) | undefined;
  }

  let {
    checked = $bindable(),
    label = undefined,
    size = 'normal',
    onclick = undefined,
    oninput = undefined,
  }: Props = $props();
</script>

<label class="toggle {size}">
  <input tabindex="0" type="checkbox" bind:checked {oninput} {onclick} />
  <SelectedDot type="check" bind:selected={checked} />
  {#if label}<span class="typo-text-bold">{label}</span>{/if}
</label>

<style>
  .toggle {
    display: flex;
    gap: 0.5rem;
    cursor: pointer;
  }

  input {
    opacity: 0;
    position: absolute;
    pointer-events: none;
  }
</style>
