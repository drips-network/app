/**
 * Like `Promise.allSettled(items.map(fn))`, but runs at most `concurrency`
 * invocations of `fn` at a time. Results are returned in input order.
 * @param items The items to map over.
 * @param fn The async function to run for each item.
 * @param concurrency Maximum number of concurrent invocations.
 * @returns Settled results in the same order as `items`.
 */
export default async function <T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = { status: 'fulfilled', value: await fn(items[index], index) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));

  return results;
}
