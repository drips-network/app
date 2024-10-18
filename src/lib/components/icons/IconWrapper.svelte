<script lang="ts">
  export let style: string | undefined = undefined;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
  on:click
  on:keydown
  width="24"
  height="24"
  style={`flex-shrink: 0; fill: var(--color-foreground-level-5); ${style ? style : ''}`}
  viewBox={`0 0 24 24`}
  xmlns="http://www.w3.org/2000/svg"
>
  <slot />
</svg>
