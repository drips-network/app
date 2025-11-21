<script lang="ts">
  import type { Component } from 'svelte';

  interface Props {
    component: Component;
    text: string;
    componentProps?: { [propName: string]: unknown } | undefined;
  }

  let { component, text, componentProps = undefined }: Props = $props();

  const SvelteComponent = $derived(component);
</script>

<SvelteComponent {...componentProps} onclick>
  <span data-testid="slot">{text}</span>
</SvelteComponent>
