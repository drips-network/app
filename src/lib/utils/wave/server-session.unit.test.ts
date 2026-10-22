import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isRedirect, type RequestEvent } from '@sveltejs/kit';
import { fetchWithWaveAuth, refreshWaveSession } from './server-session';

const API = 'http://wave-api.internal';

function makeEvent(locals: App.Locals = {}, cookieHeader = '') {
  return {
    locals,
    request: new Request('http://app.local/wave', { headers: { cookie: cookieHeader } }),
    cookies: { set: vi.fn(), delete: vi.fn(), get: vi.fn() },
  } as unknown as RequestEvent & {
    cookies: { set: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  };
}

function refreshResponse(accessToken: string, refreshToken: string) {
  const headers = new Headers();
  headers.append(
    'set-cookie',
    `wave_refresh_token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax`,
  );
  headers.append('set-cookie', `wave_access_token=${accessToken}; Path=/; SameSite=Lax`);
  return new Response(JSON.stringify({ accessToken }), { status: 200, headers });
}

/** A stand-in for the API that accepts only `validToken`. */
function apiFetch(validToken: string) {
  return vi.fn<typeof fetch>(async (input) => {
    const req = input as Request;
    const ok = req.headers.get('Authorization') === `Bearer ${validToken}`;
    return new Response(ok ? JSON.stringify({ body: await req.text() }) : 'Unauthorized', {
      status: ok ? 200 : 401,
    });
  });
}

describe('server-session', () => {
  let globalFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    globalFetch = vi.fn(async () => refreshResponse('fresh-access', 'fresh-refresh'));
    vi.stubGlobal('fetch', globalFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refreshes once and retries a request rejected with 401', async () => {
    const event = makeEvent({ waveAccessToken: 'stale', waveRefreshToken: 'old-refresh' });
    const api = apiFetch('fresh-access');

    const res = await fetchWithWaveAuth(
      event,
      new Request(`${API}/api/things`, { method: 'POST', body: 'payload' }),
      api,
      API,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ body: 'payload' });
    expect(api).toHaveBeenCalledTimes(2);
    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(event.locals.waveAccessToken).toBe('fresh-access');
    expect(event.locals.waveRefreshToken).toBe('fresh-refresh');
    expect(event.cookies.set).toHaveBeenCalledWith(
      'wave_refresh_token',
      'fresh-refresh',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
    expect(event.cookies.set).toHaveBeenCalledWith(
      'wave_access_token',
      'fresh-access',
      expect.objectContaining({ httpOnly: false, path: '/' }),
    );

    // The retry carries the new tokens, not the browser's stale cookies.
    const retried = api.mock.calls[1][0] as Request;
    expect(retried.headers.get('Cookie')).toBe(
      'wave_refresh_token=fresh-refresh; wave_access_token=fresh-access',
    );
  });

  it('shares a single refresh between parallel requests', async () => {
    const event = makeEvent({ waveAccessToken: 'stale', waveRefreshToken: 'old-refresh' });
    const api = apiFetch('fresh-access');

    const responses = await Promise.all(
      [1, 2, 3].map((i) => fetchWithWaveAuth(event, new Request(`${API}/api/${i}`), api, API)),
    );

    expect(responses.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(globalFetch).toHaveBeenCalledTimes(1);
  });

  it('clears the session and retries anonymously when the refresh fails', async () => {
    globalFetch.mockResolvedValueOnce(new Response('Invalid refresh token', { status: 401 }));
    const event = makeEvent(
      { waveAccessToken: 'stale', waveRefreshToken: 'old-refresh' },
      'wave_access_token=stale; wave_refresh_token=old-refresh; wave_device_id=abc',
    );
    const api = vi.fn<typeof fetch>(async () => new Response('Unauthorized', { status: 401 }));

    const res = await fetchWithWaveAuth(event, new Request(`${API}/api/things`), api, API);

    expect(res.status).toBe(401);
    expect(api).toHaveBeenCalledTimes(2);
    expect(event.locals.waveAccessToken).toBeUndefined();
    expect(event.locals.waveRefreshToken).toBeUndefined();
    expect(event.cookies.delete).toHaveBeenCalledWith('wave_access_token', { path: '/' });
    expect(event.cookies.delete).toHaveBeenCalledWith('wave_refresh_token', { path: '/' });

    const retried = api.mock.calls[1][0] as Request;
    expect(retried.headers.get('Authorization')).toBeNull();
    expect(retried.headers.get('Cookie')).toBe('wave_device_id=abc');
  });

  it('does not refresh again when the freshly issued token is rejected', async () => {
    const event = makeEvent({ waveRefreshToken: 'old-refresh' });
    await refreshWaveSession(event, API);
    const api = vi.fn<typeof fetch>(async () => new Response('Unauthorized', { status: 401 }));

    const res = await fetchWithWaveAuth(event, new Request(`${API}/api/things`), api, API);

    expect(res.status).toBe(401);
    expect(api).toHaveBeenCalledTimes(1);
    expect(globalFetch).toHaveBeenCalledTimes(1);
  });

  it('never retries the refresh endpoint itself', async () => {
    const event = makeEvent({ waveAccessToken: 'stale', waveRefreshToken: 'old-refresh' });
    const api = vi.fn<typeof fetch>(async () => new Response('Unauthorized', { status: 401 }));

    const res = await fetchWithWaveAuth(
      event,
      new Request(`${API}/api/auth/token/refresh`, { method: 'POST' }),
      api,
      API,
    );

    expect(res.status).toBe(401);
    expect(api).toHaveBeenCalledTimes(1);
    expect(globalFetch).not.toHaveBeenCalled();
  });

  it('redirects suspended accounts', async () => {
    globalFetch.mockResolvedValueOnce(
      new Response('Your account has been suspended.', { status: 403 }),
    );
    const event = makeEvent({ waveAccessToken: 'stale', waveRefreshToken: 'old-refresh' });
    const api = vi.fn<typeof fetch>(async () => new Response('Unauthorized', { status: 401 }));

    const err = await fetchWithWaveAuth(event, new Request(`${API}/api/things`), api, API).catch(
      (e) => e,
    );

    expect(isRedirect(err) && err.location).toBe('/wave/suspended');
    expect(event.locals.waveAccessToken).toBeUndefined();
  });
});
