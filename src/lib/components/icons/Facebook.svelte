<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <g>
    <path
      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      stroke="var(--color-foreground)"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="transparent"
    />
    <path
      d="M15.75 8.25H14.25C13.6533 8.25 13.081 8.48705 12.659 8.90901C12.2371 9.33097 12 9.90326 12 10.5V21"
      stroke="var(--color-foreground)"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="transparent"
    />
    <path
      d="M9 13.5H15"
      stroke="var(--color-foreground)"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
</IconWrapper>
