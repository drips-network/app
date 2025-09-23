import type { WorkerInfo } from 'playwright/test';

/**
 * Generate a string that is guaranteed to be unique across Playwright workers.
 * Useful when running the same test in parallel across multiple workers.
 */
export default function workerUniqueString(workerInfo: WorkerInfo, baseString?: string): string {
  const { workerIndex } = workerInfo;

  const uniqueString = baseString ? `${baseString}-${workerIndex}` : workerIndex.toString();

  return uniqueString;
}
