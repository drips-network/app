<script module lang="ts">
  export type UsecaseIllustrationConfig = {
    headline: string;
    description: string;
    href: string;
    icon: Component;
    sparkles: { x: string; y: string; delay: number }[];
    illustration: Component;
    illustrationOffset?: { x: string; y: string };
  };
</script>

<script lang="ts">
  import { fly } from 'svelte/transition';
  import Sparkle from './sparkle.svelte';
  import BezierEasing from 'bezier-easing';
  import type { Component } from 'svelte';

  interface Props {
    config: UsecaseIllustrationConfig;
    active: boolean;
  }

  let { config, active }: Props = $props();

  const easing = BezierEasing(0.47, 0, 0.23, 2);
</script>

{#if active}
  <div transition:fly={{ duration: 400, y: 10, easing }} class="active">
    {#each config.sparkles as sparkle}
      <Sparkle x={sparkle.x} y={sparkle.y} />
    {/each}
    <div
      style:transform="translate({config.illustrationOffset?.x || '0'}, {config.illustrationOffset
        ?.y || '0'})"
      style:pointer-events="none"
    >
      <config.illustration />
    </div>
  </div>
{/if}
