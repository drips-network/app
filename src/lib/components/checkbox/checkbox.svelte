<script lang="ts">
  import { createBubbler, stopPropagation } from 'svelte/legacy';

  const bubble = createBubbler();
  import SelectedDot from '../selected-dot/selected-dot.svelte';

  interface Props {
    checked: boolean;
    label?: string | undefined;
    size?: 'normal' | 'big';
  }

  let { checked = $bindable(), label = undefined, size = 'normal' }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<label class="toggle {size}" onclick={stopPropagation(bubble('click'))}>
  <input tabindex="0" type="checkbox" bind:checked />
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
