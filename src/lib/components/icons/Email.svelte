<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <g>
    <path
      d="M3 5.25H21V18C21 18.1989 20.921 18.3897 20.7803 18.5303C20.6397 18.671 20.4489 18.75 20.25 18.75H3.75C3.55109 18.75 3.36032 18.671 3.21967 18.5303C3.07902 18.3897 3 18.1989 3 18V5.25Z"
      stroke="var(--color-foreground)"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="transparent"
    />
    <path
      d="M21 5.25L12 13.5L3 5.25"
      stroke="var(--color-foreground)"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="transparent"
    />
  </g>
</IconWrapper>
