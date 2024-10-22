import type { ProgressFn } from './progress-bar.svelte';

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

export default (
  startTimeMs: number,
  durationMs: number,
  ended: boolean,
  expectedDurationText: string,
): ReturnType<ProgressFn> => {
  if (ended) {
    return {
      progressFraction: 1,
      remainingText: undefined,
    };
  }

  const now = Date.now();
  const elapsedMs = now - startTimeMs;
  let progressFraction = Math.min(elapsedMs / durationMs, 1);

  progressFraction = easeOutQuad(progressFraction);

  // Compress the progress bar to max 90% so that it never quite reaches 100% until ended is true
  progressFraction = progressFraction * 0.9;

  return {
    progressFraction,
    remainingText: expectedDurationText,
  };
};
