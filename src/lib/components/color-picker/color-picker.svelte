<script lang="ts">
  import possibleColors from '$lib/utils/project/possible-colors';

  export let selectedColor: string | undefined;
</script>

<div class="colors">
  {#each possibleColors as color}
    <div class="color" class:selected={selectedColor === color}>
      <input type="radio" name="color" bind:group={selectedColor} value={color} id={color} />
      <label class="color-label" style:background-color={color} for={color} />
    </div>
  {/each}
</div>

<style>
  .colors {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
    gap: 0.5rem;
  }

  .color input {
    display: none;
  }

  .color .color-label {
    display: block;
    height: 100%;
    width: 100%;
    height: 4rem;
    transition: all 0.3s;
    border-radius: 1rem 0 1rem 1rem;
    cursor: pointer;
    transform: scale(0.9);
    opacity: 0.6;
  }

  .color.selected .color-label {
    transform: scale(1);
    opacity: 1;
    box-shadow: var(--elevation-medium);
  }
</style>
