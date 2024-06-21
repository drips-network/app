<script lang="ts">
  import HamburgerIcon from '$lib/components/icons/Hamburger.svelte';
  export let dragging = false;
</script>

<div class="knob" class:dragging>
  <HamburgerIcon
    style="transform: rotate(-45deg); height: 20px; width: 20px; fill: white; opacity: 0.5"
  />
</div>

<style>
  .knob {
    height: 24px;
    width: 24px;
    background-color: var(--color-primary);
    border-radius: 12px 12px 12px 0;
    box-shadow:
      -1px 1px 0 1px var(--color-foreground),
      0px 0px 0 1px var(--color-foreground);
    cursor: grab;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .knob.dragging {
    cursor: grabbing;
  }
</style>
