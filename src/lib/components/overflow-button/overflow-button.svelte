<script lang="ts">
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import OverflowIcon from 'radicle-design-system/icons/Ellipsis.svelte';
  import OverflowMenu, { type Option } from './components/overflow-menu.svelte';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import scaleFromPoint from './scale-from-point';
  import { sineInOut } from 'svelte/easing';

  export let options: Option[];

  function triggerSheet() {
    cupertinoPaneStore.openSheet(OverflowMenu, { options });
  }

  let dropdownVisible = false;
  function toggleDropdown() {
    dropdownVisible = !dropdownVisible;
  }

  function trigger() {
    const bps = $breakpointsStore;

    if (!bps) return;

    const { breakpoint } = bps;

    switch (breakpoint) {
      case 'mobile':
      case 'tablet':
        triggerSheet();
        break;
      default:
        toggleDropdown();
    }
  }

  function handleWindowClick() {
    dropdownVisible = false;
  }
</script>

<svelte:window on:click={handleWindowClick} />

<button on:click|stopPropagation={trigger}>
  <OverflowIcon style="fill: var(--color-foreground)" />

  {#if dropdownVisible}
    <div
      transition:scaleFromPoint={{ delay: 0, duration: 200, easing: sineInOut }}
      class="dropdown"
    >
      <OverflowMenu {options} />
    </div>
  {/if}
</button>

<style>
  button {
    height: 2rem;
    width: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 1rem;
  }

  button:hover,
  button:focus-visible {
    background-color: var(--color-primary-level-1);
  }

  .dropdown {
    overflow: hidden;
    box-shadow: var(--elevation-medium);
    z-index: 10;
    background-color: var(--color-background);
    max-width: 14rem;
    width: fit-content;
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    border-radius: 1rem 0 1rem 1rem;
  }
</style>
