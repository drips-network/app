<script lang="ts">
  interface Props {
    style?: string | undefined;
    children?: import('svelte').Snippet;
  }

  let { style = undefined, children }: Props = $props();
</script>

<svg
  width="24"
  height="24"
  style={`flex-shrink: 0; fill: var(--color-foreground-level-5); ${style ? style : ''}`}
  viewBox={`0 0 24 24`}
  xmlns="http://www.w3.org/2000/svg"
>
  {@render children?.()}
</svg>

<style>
  svg {
    transition: fill 0.3s;
  }
</style>
