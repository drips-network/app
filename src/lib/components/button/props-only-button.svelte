<!--
  Convenience wrapper around `Button.svelte` which accepts `label` prop rather than a slot,
  and `onClick` prop rather than emitting a click event.
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Button from './button.svelte';

  export let label: string;
  export let onClick: () => void;

  export let buttonProps: ComponentProps<Button> = {};
</script>

<Button on:click={onClick} {...buttonProps}>
  {label}
</Button>
