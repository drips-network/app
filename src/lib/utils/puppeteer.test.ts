import { describe, it, expect, vi, beforeEach } from 'vitest';

const launches: { closed: boolean; killed: boolean }[] = [];

vi.mock('puppeteer', () => {
  const launch = vi.fn(async () => {
    const state = { closed: false, killed: false };
    launches.push(state);
    const proc = {
      exitCode: null as number | null,
      signalCode: null as string | null,
      on: vi.fn(),
      kill: vi.fn(() => {
        state.killed = true;
        proc.signalCode = 'SIGKILL';
      }),
    };
    return {
      process: () => proc,
      close: vi.fn(async () => {
        state.closed = true;
      }),
      newPage: vi.fn(async () => ({
        setDefaultTimeout: vi.fn(),
        setDefaultNavigationTimeout: vi.fn(),
        close: vi.fn(async () => undefined),
      })),
    };
  });
  return { default: { launch } };
});

const { PuppeteerManager, PuppeteerBusyError, PuppeteerTimeoutError } = await import('./puppeteer');

describe('PuppeteerManager.withPage', () => {
  beforeEach(async () => {
    await PuppeteerManager.kill();
    launches.length = 0;
  });

  it('runs renders in the same lane one at a time', async () => {
    let running = 0;
    let maxRunning = 0;
    const task = async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((r) => setTimeout(r, 10));
      running--;
      return 'ok';
    };

    const results = await Promise.all([1, 2, 3].map(() => PuppeteerManager.withPage(task)));
    expect(results).toEqual(['ok', 'ok', 'ok']);
    expect(maxRunning).toBe(1);
    expect(launches).toHaveLength(1);
    expect(PuppeteerManager.pending).toBe(0);
  });

  it('lets a leaf render run while a default render waits on it (no deadlock)', async () => {
    const result = await PuppeteerManager.withPage(
      () => PuppeteerManager.withPage(async () => 'inner', { lane: 'leaf' }),
      { timeoutMs: 1_000 },
    );
    expect(result).toBe('inner');
  });

  it('kills the browser and frees the queue when a render hangs', async () => {
    const hung = PuppeteerManager.withPage(() => new Promise<never>(() => undefined), {
      timeoutMs: 50,
    });
    await expect(hung).rejects.toBeInstanceOf(PuppeteerTimeoutError);
    expect(launches[0]?.killed || launches[0]?.closed).toBe(true);

    // next render gets a fresh browser
    await expect(PuppeteerManager.withPage(async () => 'after')).resolves.toBe('after');
    expect(launches).toHaveLength(2);
    expect(PuppeteerManager.pending).toBe(0);
  });

  it('rejects renders beyond the queue limit', async () => {
    const block = PuppeteerManager.withPage(() => new Promise((r) => setTimeout(r, 50)));
    const queued = Array.from({ length: 7 }, () => PuppeteerManager.withPage(async () => 1));
    await expect(PuppeteerManager.withPage(async () => 1)).rejects.toBeInstanceOf(
      PuppeteerBusyError,
    );
    await Promise.all([block, ...queued]);
    expect(PuppeteerManager.pending).toBe(0);
  });
});
