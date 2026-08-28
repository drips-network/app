import { beforeEach, describe, expect, it, vi } from 'vitest';

// `call.ts` resolves the API base URL at module load, and pulls in `./auth`
// (which reaches for SvelteKit's navigation/environment modules). Stub both so
// the module can be imported in isolation.
vi.mock('$env/static/public', () => ({
  PUBLIC_WAVE_API_URL: 'http://wave.test',
  PUBLIC_INTERNAL_WAVE_API_URL: 'http://wave.test',
  PUBLIC_SUPPRESS_MISSING_VAR_IN_PROD_ERRORS: 'true',
}));

vi.mock('./auth', () => ({
  getRefreshedAuthToken: vi.fn(async () => null),
}));

import { AccountSuspendedError, call, EmailAlreadyLinkedError } from './call';

function errorResponse(status: number, body: unknown) {
  return {
    ok: false,
    status,
    statusText: 'Error',
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as Response;
}

describe('call — email-already-linked handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws EmailAlreadyLinkedError for a 409 carrying the code', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        errorResponse(409, {
          error: 'The email address on this GitHub account (dev@example.com) is already linked…',
          code: 'email_already_linked',
        }),
      ),
    );

    await expect(call('/api/auth/oauth/github/redeem-login')).rejects.toBeInstanceOf(
      EmailAlreadyLinkedError,
    );
  });

  it("surfaces the backend's message, which names the address", async () => {
    const message =
      'The email address on this GitHub account (dev@example.com) is already linked to a different Wave account.';

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse(409, { error: message, code: 'email_already_linked' })),
    );

    await expect(call('/api/auth/oauth/github/redeem-login')).rejects.toThrow(message);
  });

  it('falls back to generic copy when the body has no usable message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse(409, 'email_already_linked but not json')),
    );

    const err = await call('/api/auth/oauth/github/redeem-login').catch((e) => e);

    expect(err).toBeInstanceOf(EmailAlreadyLinkedError);
    expect(err.message).toBe(
      'The email on this GitHub account is already linked to a different Wave account.',
    );
  });

  it('leaves other 409s as generic errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse(409, { error: 'Something else conflicted' })),
    );

    const err = await call('/api/whatever').catch((e) => e);

    expect(err).not.toBeInstanceOf(EmailAlreadyLinkedError);
    expect(err.message).toContain('API call failed: 409');
  });

  it('does not mistake the code on a non-409 status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse(500, { error: 'boom', code: 'email_already_linked' })),
    );

    const err = await call('/api/whatever').catch((e) => e);

    expect(err).not.toBeInstanceOf(EmailAlreadyLinkedError);
  });

  it('still routes 403 suspensions to AccountSuspendedError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse(403, { error: 'Account suspended' })),
    );

    await expect(call('/api/whatever')).rejects.toBeInstanceOf(AccountSuspendedError);
  });
});
