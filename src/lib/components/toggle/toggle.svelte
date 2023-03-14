<script lang="ts">
  export let checked: boolean;
  export let label: string | undefined = undefined;
  export let size: 'normal' | 'big' = 'normal';

  let focus = false;
</script>

<label class="toggle {size}">
  {#if label}<span class="typo-text-bold">{label}</span>{/if}
  <input
    tabindex="0"
    type="checkbox"
    bind:checked
    on:focus={() => (focus = true)}
    on:blur={() => (focus = false)}
  />
  <div class="slider" class:checked class:focus>
    <div class="head" />
  </div>
</label>

<style>
  .toggle {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }

  input {
    opacity: 0;
    position: absolute;
    pointer-events: none;
  }

  .slider {
    cursor: pointer;
    height: 1.5rem;
    width: 2.5rem;
    border-radius: 1rem 0 1rem 1rem;
    position: relative;
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground);
    transition: background-color 0.3s, box-shadow 0.2s;
  }

  .slider.checked {
    background-color: var(--color-foreground-level-1);
  }

  .slider:hover {
    background-color: var(--color-foreground-level-2);
  }

  .slider.focus {
    box-shadow: inset 0px 0px 0px 2px var(--color-foreground);
  }

  .slider .head {
    position: absolute;
    height: 1rem;
    top: 0.25rem;
    left: 0.25rem;
    right: 1.25rem;
    border-radius: 0.5rem;
    background-color: var(--color-foreground-level-5);
    transition: border-radius 0.2s, left 0.2s, right 0.2s, background-color 0.3s, box-shadow 0.3s,
      width 0.2s;
  }

  .slider.checked:active .head {
    left: 0.75rem;
  }

  .slider:not(.checked):active .head {
    right: 0.75rem;
    border-radius: 0.5rem 0.25rem 0.5rem 0.5rem;
  }

  .slider.checked .head {
    left: 1.25rem;
    right: 0.25rem;
    background-color: var(--color-primary);
    border-radius: 0.5rem 0 0.5rem 0.5rem;
  }
</style>
