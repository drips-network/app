<script lang="ts">
  import { onMount } from 'svelte';
  import assert from '$lib/utils/assert';

  const RESOLUTION_RATIO = window?.devicePixelRatio ?? 2;

  export let speedMultiplier = 1;

  let canvasElem: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let containerSize: [number, number];
  let container: HTMLDivElement;

  let dripImg: HTMLImageElement;

  function rr(number: number): number {
    return number * RESOLUTION_RATIO;
  }

  let drips: Drip[] = [];

  function generateDrip(maxX = 0): Drip {
    const maxY = containerSize[1] + 64;

    return {
      pos: {
        y: Math.random() * maxY,
        x: Math.random() * rr(maxX) - 48,
      },
      layer: Math.random(),
    };
  }

  onMount(() => {
    const containerBounds = container.getBoundingClientRect();
    containerSize = [containerBounds.width, containerBounds.height];

    function updateContainerSize() {
      const containerBounds = container.getBoundingClientRect();
      containerSize = [containerBounds.width, containerBounds.height];
      canvasElem.width = containerSize[0] * RESOLUTION_RATIO;
      canvasElem.height = containerSize[1] * RESOLUTION_RATIO;
    }
    updateContainerSize();

    window.addEventListener('resize', updateContainerSize);

    const context = canvasElem.getContext('2d');
    assert(context, 'Unable to create Canvas element');

    ctx = context;

    drips = [...Array(10).keys()].map(() => generateDrip(containerSize[0]));

    return () => window.removeEventListener('resize', updateContainerSize);
  });

  interface Drip {
    pos: {
      x: number;
      y: number;
    };
    /** Number in range x >= 1 & x < 0. 0.5 is the middle layer, which is in focus. */
    layer: number;
  }

  function applyParallax(layer: number): {
    blur: number;
    /** px / ms */
    speed: number;
    size: number;
  } {
    const HORIZON_DISTANCE = 20;
    const LAYER_DISTANCE = 10;
    const FOREGROUND_LAYER_SPEED = 10;

    return {
      blur: Math.abs((layer + 0.5 - 1) * 8),
      speed:
        ((HORIZON_DISTANCE - layer * LAYER_DISTANCE) * FOREGROUND_LAYER_SPEED) / HORIZON_DISTANCE,
      size: (HORIZON_DISTANCE - layer * LAYER_DISTANCE) * 2,
    };
  }

  function draw() {
    if (!canvasElem) return;

    ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);

    ctx.font = `${rr(24)}px serif`;

    const sortedDrips = drips.sort((a, b) => a.layer - b.layer).reverse();

    for (const drip of sortedDrips) {
      const { blur, speed, size } = applyParallax(drip.layer);

      const realSpeed = speed * speedMultiplier;

      ctx.filter = `blur(${blur}px) saturate(${speedMultiplier * 100}%) opacity(${
        speedMultiplier * 100 + 50
      }%)`;

      ctx.drawImage(dripImg, drip.pos.x, drip.pos.y, rr(size), rr(size));

      drip.pos.x = drip.pos.x + realSpeed;

      if (drip.pos.x > canvasElem.width) {
        drips.splice(drips.indexOf(drip), 1, generateDrip());
        drips = drips;
      }
    }

    requestAnimationFrame(draw);
  }
</script>

<div class="drips-animation" bind:this={container}>
  <canvas
    bind:this={canvasElem}
    style={`width: ${containerSize?.[0]}px; height: ${containerSize?.[1]}px;`}
  />
  <div style="display: none">
    <img bind:this={dripImg} on:load={draw} alt="rain drop" src="/assets/drip.png" />
  </div>
</div>

<style>
  .drips-animation {
    height: 100%;
  }

  canvas {
    position: absolute;
  }
</style>
