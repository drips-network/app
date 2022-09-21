<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let component: typeof SvelteComponent;
  export let text: string;

  export let componentProps: { [propName: string]: unknown } | undefined = undefined;
</script>

<svelte:component this={component} {...componentProps} on:click>
  <span data-testid="slot">{text}</span>
</svelte:component>
