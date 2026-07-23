import mapWithConcurrency from '../map-with-concurrency';

describe('map-with-concurrency.ts', () => {
  it('returns settled results in input order', async () => {
    const results = await mapWithConcurrency(
      [1, 2, 3, 4],
      (n) => (n === 3 ? Promise.reject(new Error('nope')) : Promise.resolve(n * 2)),
      2,
    );

    expect(results).toEqual([
      { status: 'fulfilled', value: 2 },
      { status: 'fulfilled', value: 4 },
      { status: 'rejected', reason: new Error('nope') },
      { status: 'fulfilled', value: 8 },
    ]);
  });

  it('never runs more than `concurrency` tasks at once', async () => {
    let running = 0;
    let maxRunning = 0;

    await mapWithConcurrency(
      Array.from({ length: 10 }, (_, i) => i),
      async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((resolve) => setTimeout(resolve, 5));
        running--;
      },
      3,
    );

    expect(maxRunning).toBe(3);
  });

  it('continues past rejections and processes all items', async () => {
    const results = await mapWithConcurrency(
      Array.from({ length: 5 }, (_, i) => i),
      (n) => (n % 2 === 0 ? Promise.reject(new Error(`fail ${n}`)) : Promise.resolve(n)),
      1,
    );

    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(3);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(2);
  });
});
