<script lang="ts" context="module">
  export type ProgressFn = () => { progressFraction: number; remainingText?: string };
</script>

<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { fade, slide } from 'svelte/transition';
  import CheckCircle from '../icons/CheckCircle.svelte';
  import CrossCircle from '../icons/CrossCircle.svelte';

  export let progressFn: ProgressFn;
  export let updateFrequencyMs = 10;
  export let errorMessage: string | undefined = undefined;

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

  $: started = progressFractionRaw > 0;
  $: done = errorMessage || progressFractionRaw >= 1;

  let progressBarColor: string;
  $: {
    if (errorMessage) {
      progressBarColor = 'var(--color-negative)';
    } else if (done) {
      progressBarColor = 'var(--color-positive)';
    } else {
      progressBarColor = 'var(--color-primary)';
    }
  }

  let textColor: string;
  $: {
    if (errorMessage) {
      textColor = 'var(--color-negative-level-6)';
    } else if (done) {
      textColor = 'var(--color-positive-level-6)';
    } else {
      textColor = 'var(--color-foreground-level-5)';
    }
  }
</script>

<div class="progress-bar-wrapper">
  <div
    class="progress-bar-container"
    style:border="1px solid {started
      ? 'var(--color-foreground)'
      : 'var(--color-foreground-level-5)'}"
  >
    <div
      class="progress-bar-inner"
      style:border-radius="0.5rem {progressBorderRadius}rem 0.5rem 0.5rem"
      style:width="{errorMessage ? 100 : $progressFraction * 100}%"
      style:background={progressBarColor}
    >
      {#if progressFractionRaw < 1 && progressFractionRaw > 0 && !errorMessage}
        <div transition:fade={{ duration: 200 }} class="progress-bar-wave-animation-overlay" />
      {/if}
    </div>
  </div>
  {#if remainingText || done}
    <p
      style:margin-top="0.25rem"
      style:min-height="2rem"
      style:display="flex"
      style:align-items="center"
      style:gap="0.125rem"
      class="typo-text"
      style:color={textColor}
      transition:slide={{ duration: 300 }}
    >
      {#if errorMessage}
        <CrossCircle style="fill: var(--color-negative-level-6)" />
        {errorMessage}
      {:else if done}
        <CheckCircle style="fill: var(--color-positive-level-6)" />
        Success
      {:else}
        {remainingText}
      {/if}
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
    position: relative;
    overflow: hidden;
    transition: background 0.3s;
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
