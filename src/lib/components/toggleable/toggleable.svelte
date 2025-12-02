<script lang="ts">
  import Toggle from '../toggle/toggle.svelte';
  import TransitionedHeight from '../transitioned-height/transitioned-height.svelte';

  interface Props {
    toggled?: boolean;
    label?: string | undefined;
    removeFromTabIndexWhileCollapsed?: boolean;
    showToggle?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    toggled = $bindable(false),
    label = undefined,
    removeFromTabIndexWhileCollapsed = true,
    showToggle = true,
    children,
  }: Props = $props();

  let collapsed = $derived(!toggled);
</script>

<div class="toggleable">
  {#if showToggle}
    <div class="toggle" class:toggled>
      <Toggle bind:checked={toggled} {label} />
    </div>
  {/if}
  <div class="content-inner" style:padding-top={showToggle ? '1rem' : ''}>
    <TransitionedHeight bind:collapsed {removeFromTabIndexWhileCollapsed}>
      {@render children?.()}
    </TransitionedHeight>
  </div>
</div>

<style>
  .toggleable {
    position: relative;
  }

  .toggle {
    color: var(--color-foreground-level-6);
    transition: color 0.3s;
  }

  .toggle.toggled {
    color: var(--color-foreground);
  }
</style>
