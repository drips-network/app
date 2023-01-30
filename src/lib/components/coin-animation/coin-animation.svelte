<script lang="ts">
  import { onMount } from 'svelte';
  import { quintIn, quintOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  export let sparkles = true;
  export let enable = true;
  export let animateOnMount = false;

  onMount(() => enable && animateOnMount && animate());

  let containerElem: HTMLDivElement;
  let tokenRotationDeg = tweened(0);
  let sparkle1Scale = tweened(0);
  let sparkle2Scale = tweened(0);

  $: sparkleFontSize = containerElem?.offsetWidth / 6;

  async function animate() {
    if (!enable) return;

    tokenRotationDeg.set(0, { duration: 0 });
    tokenRotationDeg.set(720, { duration: 1500, easing: quintOut });

    sparkle1Scale.set(2, { duration: 200, easing: quintOut, delay: 100 });
    setTimeout(() => sparkle1Scale.set(0, { duration: 200, easing: quintIn }), 300);

    sparkle2Scale.set(2, { duration: 200, easing: quintOut, delay: 300 });
    setTimeout(() => sparkle2Scale.set(0, { duration: 200, easing: quintIn }), 500);
  }
</script>

<div class="coin-animation" bind:this={containerElem} on:mouseenter={animate} on:click={animate}>
  <div class="content" style={`transform: rotate3d(0, 1, 0, ${$tokenRotationDeg}deg)`}>
    <slot />
  </div>
  {#if sparkles}
    <div
      class="sparkle one"
      style="transform: scale({$sparkle1Scale}); font-size: {sparkleFontSize}px"
    >
      ✨
    </div>
    <div
      class="sparkle two"
      style="transform: scale({$sparkle2Scale}); font-size: {sparkleFontSize}px"
    >
      ✨
    </div>
  {/if}
</div>

<style>
  .coin-animation {
    position: relative;
    overflow: visible;
    width: 100%;
    height: 100%;
  }

  .sparkle {
    pointer-events: none;
    position: absolute;
    font-size: 10%;
    text-shadow: 0px 0px 5px yellow;
  }

  .sparkle.one {
    top: 0;
    left: 0;
  }

  .sparkle.two {
    bottom: 0;
    right: 0;
  }
</style>
