<script lang="ts">
  import { onMount } from 'svelte';

  interface Drip {
    startTimestamp: number;
    pathIndex: number;
    x: number | undefined;
    y: number | undefined;
    scale: number | undefined;
  }

  export let svgElemAttrs: Record<string, string>;

  let currentDrips: Drip[] = [];

  let start: number | undefined = undefined;

  // options
  const speed = 0.1; // pixels per millisecond
  const radius = 3;
  const maxDrips = 10;

  function generateRandomUniqueInt(min: number, max: number, excludedNumbers: number[]) {
    let num = Math.floor(Math.random() * (max - min + 1)) + min;
    while (excludedNumbers.includes(num)) {
      num = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return num;
  }

  let lastAnimationFrameRequest: number | undefined = undefined;

  function animate(timestamp: number) {
    if (!start) {
      start = timestamp;
    }

    if (currentDrips.length < Math.min(paths.length, maxDrips)) {
      currentDrips.push({
        startTimestamp: timestamp,
        pathIndex: generateRandomUniqueInt(
          0,
          paths.length - 1,
          currentDrips.map((drip) => drip.pathIndex),
        ),
        x: undefined,
        y: undefined,
        scale: undefined,
      });
    }

    currentDrips.forEach((drip, index) => {
      let { element: path, reverse } = paths[drip.pathIndex];

      if (!path) return;

      // If the path coordinates and scale are undefined, set them to the start of the path
      if (drip.x === undefined && drip.y === undefined && drip.scale === undefined) {
        drip.x = path.getPointAtLength(0).x;
        drip.y = path.getPointAtLength(0).y;
        drip.scale = 0;
      }

      if (path) {
        const pathLength = path.getTotalLength();

        const duration = pathLength / speed;
        let time = timestamp - drip.startTimestamp;
        const distance = !reverse ? speed * time : pathLength - speed * time;

        let dripScale = 0;
        if (time < duration / 4) {
          dripScale = time / (duration / 4); // drip scale animation up
        } else if (time > (duration * 3) / 4) {
          dripScale = (duration - time) / (duration / 4); // drip scale animation down
        } else {
          dripScale = 1; // drip scale animation hold
        }

        drip.x = path.getPointAtLength(distance).x;
        drip.y = path.getPointAtLength(distance).y;
        drip.scale = dripScale;

        // If the path is fully covered, set dripsCoordinates to undefined
        if (distance > pathLength || distance < 0) {
          drip.x = undefined;
          drip.y = undefined;
          drip.scale = undefined;
        }

        // Assign the drip into the currentDrips array
        currentDrips[index] = drip;

        // If the drip is fully covered, remove it from the currentDrips array
        if (drip.x === undefined && drip.y === undefined && drip.scale === undefined) {
          currentDrips.splice(index, 1);
        }
      }
    });

    lastAnimationFrameRequest = requestAnimationFrame(animate);
  }

  let paths: {
    element: SVGPathElement;
    reverse: boolean;
  }[] = [];
  let contentEl: HTMLDivElement;

  onMount(() => {
    paths = Array.from(contentEl.querySelectorAll('path[data-drip-path]')).map((el) => ({
      element: el as SVGPathElement,
      reverse: el.getAttribute('data-drip-path-reverse') !== null,
    }));
    animate(0);

    return () => {
      if (lastAnimationFrameRequest) cancelAnimationFrame(lastAnimationFrameRequest);
    };
  });
</script>

<div bind:this={contentEl} class="content">
  <svg {...svgElemAttrs}>
    <slot />
    {#each currentDrips as { x, y, scale }}
      <circle r={(scale ?? 0) * radius} cx={x} cy={y} fill="var(--color-primary)" class="circle" />
    {/each}
  </svg>
</div>
