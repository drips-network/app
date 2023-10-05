<script lang="ts">
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import OverflowIcon from 'radicle-design-system/icons/Ellipsis.svelte';
  import OverflowMenu, { type Option } from './components/overflow-menu.svelte';
  import modal from '$lib/stores/modal';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';

  export let options: Option[];

  function triggerSheet() {
    cupertinoPaneStore.openSheet(OverflowMenu, { options });
  }

  function triggerModal() {
    modal.show(OverflowMenu, undefined, { options });
  }

  function trigger() {
    const bps = $breakpointsStore;

    if (!bps) return;

    const { breakpoint } = bps;

    switch (breakpoint) {
      case 'desktop':
      case 'desktopWide':
        triggerModal();
        break;
      default:
        triggerSheet();
        break;
    }
  }
</script>

<button class="icon" on:click={trigger}>
  <OverflowIcon style="fill: var(--color-foreground)" />
</button>

<style>
  .icon {
    transform: rotate(90deg);
  }
</style>
