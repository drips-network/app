import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));
// `auth.ts` pulls in `call.ts`, which reads the public API URL at import time.
vi.mock('./call', () => ({
  authenticatedCall: vi.fn(),
  call: vi.fn(),
  AccountSuspendedError: class extends Error {},
  UnverifiedEmailError: class extends Error {},
}));

const SERVER_TIME = Date.UTC(2026, 8, 23, 12, 0, 0);
const MINUTES = 60_000;

function fakeJwt(exp: number): string {
  const encode = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    iss: 'drips-wave',
    sub: '3a32e03b-797f-48ca-91bb-599ad273e653',
    iat: Math.floor(SERVER_TIME / 1000),
    exp,
    name: 'someone',
    email: 'someone@example.com',
    picture: 'https://avatars.githubusercontent.com/u/1',
    signUpDate: '2026-01-01T00:00:00.000Z',
  })}.sig`;
}

describe('correctedNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    // `vi.doMock` in the server-side test below persists across tests.
    vi.doMock('$app/environment', () => ({ browser: true }));
  });
  afterEach(() => vi.useRealTimers());

  it('judges time by the server clock when the device clock runs 20 minutes fast', async () => {
    vi.setSystemTime(SERVER_TIME + 20 * MINUTES);
    const { correctedNow } = await import('./server-clock');

    expect(correctedNow(SERVER_TIME)).toBe(SERVER_TIME);

    // Between server loads the local clock advances the corrected one.
    vi.advanceTimersByTime(5_000);
    expect(correctedNow(SERVER_TIME)).toBe(SERVER_TIME + 5_000);

    // A new server time re-measures the offset.
    vi.setSystemTime(SERVER_TIME + 60 * MINUTES + 30 * MINUTES);
    expect(correctedNow(SERVER_TIME + 60 * MINUTES)).toBe(SERVER_TIME + 60 * MINUTES);
  });

  it('falls back to the device clock without a server time', async () => {
    vi.setSystemTime(SERVER_TIME + 20 * MINUTES);
    const { correctedNow } = await import('./server-clock');
    expect(correctedNow(undefined)).toBe(SERVER_TIME + 20 * MINUTES);
  });

  it('never touches its state on the server', async () => {
    vi.doMock('$app/environment', () => ({ browser: false }));
    vi.setSystemTime(SERVER_TIME + 20 * MINUTES);
    const { correctedNow } = await import('./server-clock');
    expect(correctedNow(SERVER_TIME)).toBe(SERVER_TIME + 20 * MINUTES);
  });
});

describe('getUserData with a skewed device clock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    // `vi.doMock` in the server-side test below persists across tests.
    vi.doMock('$app/environment', () => ({ browser: true }));
  });
  afterEach(() => vi.useRealTimers());

  it('rejects a fresh token on the raw device clock but accepts it on the corrected one', async () => {
    vi.setSystemTime(SERVER_TIME + 20 * MINUTES);
    const { getUserData } = await import('./auth');
    const { correctedNow } = await import('./server-clock');
    const jwt = fakeJwt(Math.floor((SERVER_TIME + 10 * MINUTES) / 1000));

    expect(getUserData(jwt)).toBeNull();
    expect(getUserData(jwt, correctedNow(SERVER_TIME))?.id).toBe(
      '3a32e03b-797f-48ca-91bb-599ad273e653',
    );
  });

  it('still rejects a genuinely expired token on the corrected clock', async () => {
    vi.setSystemTime(SERVER_TIME + 20 * MINUTES);
    const { getUserData } = await import('./auth');
    const { correctedNow } = await import('./server-clock');
    const jwt = fakeJwt(Math.floor((SERVER_TIME - 1 * MINUTES) / 1000));

    expect(getUserData(jwt, correctedNow(SERVER_TIME))).toBeNull();
  });
});
