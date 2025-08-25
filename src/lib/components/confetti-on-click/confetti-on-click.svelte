<!-- Credit to https://github.com/Mitcheljager/svelte-confetti/blob/master/src/routes/ToggleConfetti.svelte 💕 -->

<script>
  import { onMount, tick } from 'svelte';

  export let alsoOnMount = false;
  export let toggleOnce = false;
  export let relative = true;

  let active = false;

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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span on:click={click} class:relative>
  <slot name="label" />

  {#if active}
    <div class="confetti">
      <slot />
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
