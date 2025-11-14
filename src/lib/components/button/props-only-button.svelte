<!--
  Convenience wrapper around `Button.svelte` which accepts `label` prop rather than a slot,
  and `onClick` prop rather than emitting a click event.
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Button from './button.svelte';

  interface Props {
    label: string;
    onClick: () => void;
    buttonProps?: ComponentProps<typeof Button>;
  }

  let { label, onClick, buttonProps = {} }: Props = $props();
</script>

<Button onclick={onClick} {...buttonProps}>
  {label}
</Button>
