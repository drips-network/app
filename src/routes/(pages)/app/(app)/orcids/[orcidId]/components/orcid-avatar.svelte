<script lang="ts">
  import OrcidIcon from '$lib/components/icons/Orcid.svelte';

  type Size = 'tiny' | 'small' | 'medium' | 'large' | 'huge';
  export let size: Size = 'small';
  export let outline = false;

  /** Makes the orcid icon grey instead of primary. */
  export let disabled = false;

  const CONTAINER_SIZES: Record<Size, string> = {
    tiny: '1.5rem',
    small: '2rem',
    medium: '3rem',
    large: '4rem',
    huge: '8rem',
  };
  $: containerSize = CONTAINER_SIZES[size];

  $: dimensionCss = {
    tiny: '100%',
    small: '100%',
    medium: '65%',
    large: '65%',
    huge: '50%',
  }[size];
</script>

<div
  class="wrapper overflow-hidden select-none relative flex-shrink-0 rounded-full flex items-center justify-center size-{size}"
  style="width: {containerSize}; height: {containerSize}"
  class:with-outline={outline}
  class:disabled
>
  <OrcidIcon
    style="
      width: {dimensionCss};
      height: {dimensionCss};
      fill: {disabled ? 'var(--color-foreground-level-6)' : 'var(--color-foreground)'};"
  />
</div>

<style>
  .wrapper:not(.size-tiny, .size-small) {
    background-color: var(--color-foreground-level-2);
  }

  .wrapper.disabled {
    background-color: var(--color-foreground-level-3);
  }

  .with-outline {
    border: 1px solid var(--color-foreground);
  }
</style>
