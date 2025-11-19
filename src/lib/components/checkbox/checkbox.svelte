<script lang="ts">
  import SelectedDot from '../selected-dot/selected-dot.svelte';

  export let checked: boolean;
  export let label: string | undefined = undefined;
  export let size: 'normal' | 'big' = 'normal';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<label class="toggle {size}" on:click|stopPropagation>
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
