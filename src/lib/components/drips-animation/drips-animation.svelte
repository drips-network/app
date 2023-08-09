<script lang="ts">
  import { onMount } from 'svelte';
  import assert from '$lib/utils/assert';

  const RESOLUTION_RATIO = window?.devicePixelRatio ? Math.min(window?.devicePixelRatio, 2) : 2;

  export let speedMultiplier = 1;
  export let vertical = false;

  let canvasElem: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let containerSize: [number, number];
  let container: HTMLDivElement;

  let dripImg: HTMLImageElement;
  let dripImgVertical: HTMLImageElement;

  function rr(number: number): number {
    return number * RESOLUTION_RATIO;
  }

  let drips: Drip[] = [];
  let maxDripsOnScreen: number;

  function generateDrip(maxX = 0): Drip {
    const maxOffset = rr(vertical ? containerSize[0] : containerSize[1]) - rr(32);

    const x = Math.floor(Math.random() * rr(maxX) - 48);
    const y = Math.floor(Math.random() * maxOffset);

    return {
      pos: {
        y: vertical ? x : y,
        x: vertical ? y : x,
      },
      layer: Math.random(),
    };
  }

  let previouslyVertical = vertical;

  function updateContainerSize() {
    const containerBounds = container.getBoundingClientRect();
    containerSize = [containerBounds.width, containerBounds.height];
    canvasElem.width = containerSize[0] * RESOLUTION_RATIO;
    canvasElem.height = containerSize[1] * RESOLUTION_RATIO;

    const orientationChanged = previouslyVertical !== vertical;

    if (drips.length === 0 || orientationChanged) {
      maxDripsOnScreen = Math.min(Math.max(Math.floor(containerSize[0] / 25), 1), 20);
      drips = [...Array(maxDripsOnScreen).keys()].map(() => generateDrip(containerSize[0]));
    } else {
      // Delete any drips outside of the new bounds

      const newDrips: Drip[] = [];

      for (const drip of drips) {
        if (
          (vertical ? drip.pos.y : drip.pos.x) < rr(vertical ? containerSize[1] : containerSize[0])
        ) {
          newDrips.push(drip);
        }
      }
    }
  }

  onMount(() => {
    const containerBounds = container.getBoundingClientRect();
    containerSize = [containerBounds.width, containerBounds.height];

    updateContainerSize();

    const context = canvasElem.getContext('2d');
    assert(context, 'Unable to create Canvas element');

    ctx = context;
  });

  const resizeObserver = new ResizeObserver(updateContainerSize);

  onMount(() => {
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
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
    /** px / ms */
    speed: number;
    size: number;
  } {
    const HORIZON_DISTANCE = 20;
    const LAYER_DISTANCE = 10;
    const FOREGROUND_LAYER_SPEED = 1;

    return {
      speed:
        ((HORIZON_DISTANCE - layer * LAYER_DISTANCE) * FOREGROUND_LAYER_SPEED) / HORIZON_DISTANCE,
      size: (HORIZON_DISTANCE - layer * LAYER_DISTANCE) * 2,
    };
  }

  let lastDraw = new Date().getTime();
  let paused = false;

  function draw() {
    if (!canvasElem) return;

    const currentMillis = new Date().getTime();
    const millisecondsSinceLastDraw = currentMillis - lastDraw;

    ctx.clearRect(0, 0, rr(containerSize[0]), rr(containerSize[1]));

    ctx.font = `${rr(24)}px serif`;

    const sortedDrips = drips.sort((a, b) => a.layer - b.layer).reverse();

    for (const drip of sortedDrips) {
      const { speed, size } = applyParallax(drip.layer);

      const realSpeed = speed * speedMultiplier;

      ctx.filter = `saturate(${Math.floor(speedMultiplier * 100)}%) opacity(${Math.floor(
        speedMultiplier * 100 + 20,
      )}%)`;

      ctx.drawImage(
        vertical ? dripImgVertical : dripImg,
        drip.pos.x,
        drip.pos.y,
        rr(size),
        rr(size),
      );

      if (vertical) {
        drip.pos.y = Math.floor(drip.pos.y + millisecondsSinceLastDraw * realSpeed);
      } else {
        drip.pos.x = Math.floor(drip.pos.x + millisecondsSinceLastDraw * realSpeed);
      }

      if (
        (vertical ? drip.pos.y : drip.pos.x) > rr(vertical ? containerSize[1] : containerSize[0])
      ) {
        drips.splice(drips.indexOf(drip), 1, generateDrip());
        drips = drips;
      }
    }

    lastDraw = currentMillis;
    if (!paused) requestAnimationFrame(draw);
  }
</script>

<div class="drips-animation" bind:this={container}>
  <canvas
    bind:this={canvasElem}
    style={`width: ${containerSize?.[0]}px; height: ${containerSize?.[1]}px;`}
  />
  <div style="display: none">
    <img
      bind:this={dripImg}
      on:load={() => !vertical && draw()}
      alt="rain drop"
      src="/assets/drip.webp"
    />
    <img
      bind:this={dripImgVertical}
      on:load={() => vertical && draw()}
      alt="rain drop"
      src="/assets/drip-vertical.webp"
    />
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
