<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { quintIn, quintOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  interface Props {
    sparkles?: boolean;
    enable?: boolean;
    animateOnMount?: boolean;
    playSound?: boolean;
    animateOnHover?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    sparkles = true,
    enable = true,
    animateOnMount = false,
    playSound = false,
    animateOnHover = true,
    children,
  }: Props = $props();

  const coinSound = browser ? new Audio('/assets/coin-sound.mp3') : undefined;
  if (coinSound) coinSound.volume = 0.1;

  onMount(() => {
    if (enable && animateOnMount) animate(false);
  });

  let containerElem = $state<HTMLDivElement>();
  let tokenRotationDeg = tweened(0);
  let sparkle1Scale = tweened(0);
  let sparkle2Scale = tweened(0);

  let sparkleFontSize = $derived(containerElem ? containerElem?.offsetWidth / 6 : undefined);

  async function animate(click: boolean) {
    if (!enable) return;
    if (!animateOnHover && !click) return;

    if (click && playSound && coinSound) {
      coinSound.currentTime = 0;
      coinSound.play();
    }

    tokenRotationDeg.set(0, { duration: 0 });
    tokenRotationDeg.set(720, { duration: 1500, easing: quintOut });

    sparkle1Scale.set(2, { duration: 200, easing: quintOut, delay: 100 });
    setTimeout(() => sparkle1Scale.set(0, { duration: 200, easing: quintIn }), 300);

    sparkle2Scale.set(2, { duration: 200, easing: quintOut, delay: 300 });
    setTimeout(() => sparkle2Scale.set(0, { duration: 200, easing: quintIn }), 500);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="coin-animation"
  bind:this={containerElem}
  onmouseenter={() => animate(false)}
  onclick={() => animate(true)}
  onkeydown={() => animate(true)}
>
  <div class="content" style={`transform: rotate3d(0, 1, 0, ${$tokenRotationDeg}deg)`}>
    {@render children?.()}
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
    user-select: none;
  }

  .content {
    height: 100%;
    width: 100%;
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
