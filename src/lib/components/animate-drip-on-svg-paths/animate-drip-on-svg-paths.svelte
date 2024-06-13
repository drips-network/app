<script lang="ts">
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import { onMount } from 'svelte';

  interface Drip {
    startTimestamp: number;
    pathIndex: number;
    x: number | undefined;
    y: number | undefined;
    scale: number | undefined;
  }

  export let pathQueries: string[] = [];

  export let paths: SVGPathElement[] = [];

  let currentDrips: Drip[] = [];

  let start: number | undefined = undefined;

  // options
  const speed = 0.1; // pixels per millisecond
  const radius = 3;
  const maxDrips = 3;

  function generateRandomUniqueInt(min: number, max: number, excludedNumbers: number[]) {
    let num = Math.floor(Math.random() * (max - min + 1)) + min;
    while (excludedNumbers.includes(num)) {
      num = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return num;
  }

  function animate(timestamp: number) {
    if (!start) {
      start = timestamp;
    }

    if (currentDrips.length < Math.min(paths.length, maxDrips)) {
      currentDrips.push({
        startTimestamp: timestamp,
        pathIndex: generateRandomUniqueInt(
          0,
          paths.length,
          currentDrips.map((drip) => drip.pathIndex),
        ),
        x: undefined,
        y: undefined,
        scale: undefined,
      });
    }

    currentDrips.forEach((drip, index) => {
      let path = paths[drip.pathIndex];

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
        const distance = speed * time;

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
        if (distance >= pathLength) {
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

    requestAnimationFrame(animate);
  }

  let el: HTMLSpanElement;

  onMount(async () => {
    // collect paths if received queries
    if (pathQueries.length) {
      const svg = el.parentElement;
      paths = mapFilterUndefined(pathQueries, (string) => {
        const match = svg?.querySelector(`path[d^="${string}"]`);
        if (match instanceof SVGPathElement) {
          return match;
        }
        return undefined;
      });
    }

    requestAnimationFrame(animate);
  });
</script>

<span bind:this={el} />

<slot />

{#each currentDrips as { x, y, scale }}
  <circle r={(scale ?? 0) * radius} cx={x} cy={y} fill="var(--color-primary)" class="circle" />
{/each}
