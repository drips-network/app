<script context="module" lang="ts">
  export type UsecaseIllustrationConfig = {
    headline: string;
    description: string;
    icon: ComponentType;
    sparkles: { x: string; y: string; delay: number }[];
    illustration: ComponentType;
    illustrationOffset?: { x: string; y: string };
  }
</script>

<script lang="ts">
  import { fly } from "svelte/transition";
  import Sparkle from "./sparkle.svelte";
  import BezierEasing from 'bezier-easing';
  import type { ComponentType } from "svelte";

  export let config: UsecaseIllustrationConfig;
  export let active: boolean;

  const easing = BezierEasing(0.47, 0, 0.23, 2);
</script>

{#if active}
  <div transition:fly={{ duration: 400, y: 10, easing }} class="active">
    {#each config.sparkles as sparkle}
      <Sparkle
        x={sparkle.x}
        y={sparkle.y}
        delay={sparkle.delay}
      />
    {/each}
    <div style:transform="translate({config.illustrationOffset?.x || '0'}, {config.illustrationOffset?.y || '0'})">
      <svelte:component this={config.illustration} />
    </div>
  </div>
{/if}
