<script lang="ts">
  import Toggle from '../toggle/toggle.svelte';
  import TransitionedHeight from '../transitioned-height/transitioned-height.svelte';

  export let toggled = false;
  export let label: string | undefined = undefined;
  export let removeFromTabIndexWhileCollapsed = true;
  export let showToggle = true;

  $: collapsed = !toggled;
</script>

<div class="toggleable">
  {#if showToggle}
    <div class="toggle" class:toggled>
      <Toggle bind:checked={toggled} {label} />
    </div>
  {/if}
  <div class="content-inner" style:padding-top={showToggle ? '1rem' : ''}>
    <TransitionedHeight bind:collapsed {removeFromTabIndexWhileCollapsed}>
      <slot />
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
