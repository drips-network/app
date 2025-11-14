<script lang="ts">
  import type { ComponentType } from 'svelte';


  interface Props {
    component: ComponentType;
    text: string;
    componentProps?: { [propName: string]: unknown } | undefined;
  }

  let { component, text, componentProps = undefined }: Props = $props();

  const SvelteComponent = $derived(component);
</script>

<SvelteComponent {...componentProps} onclick>
  <span data-testid="slot">{text}</span>
</SvelteComponent>
