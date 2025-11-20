<script lang="ts">
  export let style: string | undefined = undefined;
  export let boxDimension: number = 24;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
  on:click
  on:keydown
  width={boxDimension}
  height={boxDimension}
  style={`flex-shrink: 0; fill: var(--color-foreground-level-5); ${style ? style : ''}`}
  viewBox={`0 0 ${boxDimension} ${boxDimension}`}
  xmlns="http://www.w3.org/2000/svg"
>
  <slot />
</svg>

<style>
  svg {
    transition: fill 0.3s;
  }
</style>
