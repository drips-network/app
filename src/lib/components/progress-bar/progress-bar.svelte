<script lang="ts" context="module">
  export type ProgressFn = () => { progressFraction: number; remainingText?: string };
</script>

<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { fade, slide } from 'svelte/transition';

  export let progressFn: ProgressFn;
  export let updateFrequencyMs = 10;

  let interval: ReturnType<typeof setInterval> | undefined;

  let progressFractionRaw = 0;
  let progressFraction = tweened(0, { duration: 200 });
  let remainingText: string | undefined;

  $: {
    clearInterval(interval);

    interval = setInterval(() => {
      const { progressFraction: newProgressFraction, remainingText: newRemainingText } =
        progressFn();

      progressFractionRaw = newProgressFraction;
      progressFraction.set(newProgressFraction);
      remainingText = newRemainingText;
    }, updateFrequencyMs);
  }

  // Should be 0.5 all the way until 80% progress, then start interpolating towards 0 at 100%
  $: progressBorderRadius =
    $progressFraction < 0.8 ? 0.5 : 0.5 - (0.5 * Math.max(0, $progressFraction - 0.8)) / 0.2;
</script>

<div class="progress-bar-wrapper">
  <div class="progress-bar-container">
    <div
      class="progress-bar-inner"
      style:border-radius="0.5rem {progressBorderRadius}rem 0.5rem 0.5rem"
      style:width="{$progressFraction * 100}%"
    >
      {#if progressFractionRaw < 1 && progressFractionRaw > 0}
        <div transition:fade={{ duration: 200 }} class="progress-bar-wave-animation-overlay" />
      {/if}
    </div>
  </div>
  {#if remainingText}
    <p style:margin-top="1rem" class="typo-text-small" transition:slide={{ duration: 300 }}>
      {remainingText}
    </p>
  {/if}
</div>

<style>
  .progress-bar-wrapper {
    color: var(--color-foreground-level-6);
  }

  .progress-bar-container {
    width: 100%;
    height: 1rem;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    background: var(--color-background);
    overflow: hidden;
    border: 1px solid var(--color-foreground);
    position: relative;
  }

  .progress-bar-inner {
    height: 100%;
    background: var(--color-primary);
    position: relative;
    overflow: hidden;
  }

  .progress-bar-wave-animation-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      transparent 40%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 60%,
      transparent 100%
    );
    background-size: 400% 400%;
    background-position: 0 0;
    animation: wave 4s infinite;
    animation-direction: reverse;
  }

  @keyframes wave {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 100% 0;
    }
  }
</style>
