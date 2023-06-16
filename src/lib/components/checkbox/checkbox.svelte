<script lang="ts">
  import SelectedDot from '../selected-dot/selected-dot.svelte';

  export let checked: boolean;
  export let label: string | undefined = undefined;
  export let size: 'normal' | 'big' = 'normal';

  let focus = false;
</script>

<label class="toggle {size}">
  <input
    tabindex="0"
    type="checkbox"
    bind:checked
    on:focus={() => (focus = true)}
    on:blur={() => (focus = false)}
  />
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
