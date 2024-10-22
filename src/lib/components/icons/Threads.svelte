<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <g>
    <path
      d="M18.75 7.27969C17.7994 4.80844 15.8034 3 12 3C6 3 4.5 7.5 4.5 12C4.5 16.5 6 21 12 21C16.5 21 18.75 18 18.75 15.75C18.75 9.75 9 9.75 9 14.25C9 18 15.75 18 15.75 12C15.75 6.75 10.5 6.75 9 9"
      stroke="var(--color-foreground)"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="transparent"
    />
  </g>
</IconWrapper>
