<script lang="ts">
  export let checked: boolean;
  export let label: string | undefined = undefined;
  export let size: 'normal' | 'big' = 'normal';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<label class="toggle {size}" on:click|stopPropagation>
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
