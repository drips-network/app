<script lang="ts">
  import DripListIcon from '$lib/components/icons/DripList.svelte';

  type Size = 'tiny' | 'small' | 'medium' | 'large' | 'huge';

  interface Props {
    size?: Size;
    outline?: boolean;
    /** Makes the drip list icon grey instead of primary. */
    disabled?: boolean;
  }

  let { size = 'small', outline = false, disabled = false }: Props = $props();

  const CONTAINER_SIZES: Record<Size, string> = {
    tiny: '1.5rem',
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    huge: '8rem',
  };
  let containerSize = $derived(CONTAINER_SIZES[size]);
</script>

<div
  class="wrapper overflow-hidden select-none relative flex-shrink-0 rounded-full flex items-center justify-center"
  style="width: {containerSize}; height: {containerSize}"
  class:with-outline={outline}
  class:disabled
>
  <DripListIcon
    style="
      width: min(80%, 3rem);
      height: min(80%, 3rem); 
      fill: {disabled ? 'var(--color-foreground-level-6)' : 'var(--color-foreground-level-5)'};"
  />
</div>

<style>
  .wrapper {
    background-color: var(--color-foreground-level-2);
  }

  .wrapper.disabled {
    background-color: var(--color-foreground-level-3);
  }

  .with-outline {
    border: 1px solid var(--color-foreground-level-3);
  }
</style>
