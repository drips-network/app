import { createAsyncRequestGuard } from './async-request-guard';

describe('createAsyncRequestGuard', () => {
  it('marks older requests as stale after a newer one begins', () => {
    const guard = createAsyncRequestGuard();

    const firstRequest = guard.beginRequest();
    const secondRequest = guard.beginRequest();

    expect(guard.isCurrent(firstRequest)).toBe(false);
    expect(guard.isCurrent(secondRequest)).toBe(true);
  });

  it('marks in-flight requests as stale after invalidation', () => {
    const guard = createAsyncRequestGuard();

    const request = guard.beginRequest();
    guard.invalidate();

    expect(guard.isCurrent(request)).toBe(false);
  });
});
