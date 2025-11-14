<!-- Credit to https://github.com/Mitcheljager/svelte-confetti/blob/master/src/routes/ToggleConfetti.svelte 💕 -->

<script lang="ts">
  import { onMount, tick } from 'svelte';

  interface Props {
    alsoOnMount?: boolean;
    toggleOnce?: boolean;
    relative?: boolean;
    label?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
  }

  let {
    alsoOnMount = false,
    toggleOnce = false,
    relative = true,
    label,
    children
  }: Props = $props();

  let active = $state(false);

  async function click() {
    if (toggleOnce) {
      active = !active;
      return;
    }

    active = false;
    await tick();
    active = true;
  }

  onMount(() => {
    if (alsoOnMount) {
      click();
    }
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span onclick={click} class:relative>
  {@render label?.()}

  {#if active}
    <div class="confetti">
      {@render children?.()}
    </div>
  {/if}
</span>

<style>
  .relative {
    position: relative;
  }

  .relative .confetti {
    position: absolute;
    top: 50%;
    left: 50%;
  }
</style>
