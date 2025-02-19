<script lang="ts">
  import IconWrapper from './IconWrapper.svelte';

  export let style: string | undefined = undefined;
</script>

<IconWrapper on:click {style}>
  <circle cx="12" cy="12" r="11.5" stroke="var(--color-foreground)" />
  <path
    d="M18.2308 1.74235C16.4146 0.636792 14.2817 0 12 0V12L18.2308 1.74235Z"
    fill="var(--color-primary)"
  />
</IconWrapper>
