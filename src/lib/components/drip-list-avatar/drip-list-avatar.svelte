<script lang="ts">
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';

  type Size = 'tiny' | 'small' | 'medium' | 'large' | 'huge';
  export let size: Size = 'small';
  export let outline = false;

  const CONTAINER_SIZES: Record<Size, string> = {
    tiny: '1.5rem',
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    huge: '8rem',
  };
  $: containerSize = CONTAINER_SIZES[size];
</script>

<div
  class="wrapper"
  style="width: {containerSize}; height: {containerSize}"
  class:with-outline={outline}
>
  <DripListIcon style="width: min(80%, 3rem); height: min(80%, 3rem; fill: var(--color-primary)" />
</div>

<style>
  .wrapper {
    height: 2rem;
    width: 2rem;
    background-color: var(--color-foreground-level-2);
    overflow: hidden;
    user-select: none;
    position: relative;
    flex-shrink: 0;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .with-outline {
    border: 1px solid var(--color-foreground);
  }
</style>
