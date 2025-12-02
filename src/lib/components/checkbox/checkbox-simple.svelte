<script lang="ts">
  interface Props {
    checked?: boolean;
    label?: string | undefined;
    size?: 'normal' | 'big';
    oninput?: (event: Event) => void;
  }

  let {
    checked = false,
    label = undefined,
    size = 'normal',
    oninput = undefined,
  }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<label class="toggle {size}" onclick={(e) => e.stopPropagation()} {oninput}>
  <input tabindex="0" type="checkbox" bind:checked />
  {#if label}<span class="typo-text-bold">{label}</span>{/if}
</label>

<style>
  .toggle {
    display: flex;
    gap: 0.5rem;
    cursor: pointer;
  }

  input {
    height: 1rem;
    width: 1rem;
  }
</style>
