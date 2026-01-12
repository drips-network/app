import { afterEach, describe, expect, it, vi } from 'vitest';
import doBatchWithErrorModal from '../make-batch-call-with-error-modal';

const showSpy = vi.fn();

vi.mock('$lib/stores/modal', () => ({
  default: {
    show: showSpy,
  },
}));

vi.mock('$lib/components/error-modal/batch-error-modal.svelte', () => ({
  default: vi.fn(),
}));

describe('make-batch-call-with-error-modal', () => {
  afterEach(() => {
    showSpy.mockClear();
  });

  it('processes functions with limited concurrency and preserves order', async () => {
    let active = 0;
    let maxActive = 0;
    const order: number[] = [];

    const fns = Array.from({ length: 5 }, (_, idx) => async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((res) => setTimeout(res, 5));
      order.push(idx);
      active--;
      return { success: true } as const;
    });

    const results = await doBatchWithErrorModal(fns, { concurrency: 2 });

    expect(results.every((r) => r.success)).toBe(true);
    expect(maxActive).toBeLessThanOrEqual(2);
    expect(order).toEqual([0, 1, 2, 3, 4]);
    expect(showSpy).not.toHaveBeenCalled();
  });

  it('shows modal when any entry fails and reports error messages', async () => {
    const error = new Error('boom');
    const fns = [
      () => ({ success: true }) as const,
      () => {
        throw error;
      },
      async () => ({ success: true }) as const,
    ];

    const results = await doBatchWithErrorModal(fns, { concurrency: 3 });

    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
    if (!results[1].success) {
      expect(results[1].errorMessage).toBe('boom');
    }
    expect(showSpy).toHaveBeenCalledTimes(1);
    const callArgs = showSpy.mock.calls[0];
    expect(callArgs[2]).toEqual({ errors: [{ errorMessage: 'boom' }] });
  });
});
