import { browser } from '$app/environment';
import z from 'zod';
import { call } from './call';
import { jwtDecode } from 'jwt-decode';
import type { WaveUser } from './types/user';

const accessClaimJwtSchema = z.object({
  iss: z.literal('drips-wave'),
  sub: z.uuid(),
  iat: z.number().int(),
  exp: z.number().int(),
  isSuperAdmin: z.boolean(),
  name: z.string(),
  email: z.email(),
  picture: z.string().url(),
});

export function getUserData(jwt: string | null): WaveUser | null {
  if (!jwt) {
    return null;
  }

  const content = accessClaimJwtSchema.parse(jwtDecode(jwt));

  const now = Math.floor(Date.now() / 1000);
  if (content.exp < now) {
    return null;
  }

  return {
    id: content.sub,
    gitHubUsername: content.name,
    gitHubAvatarUrl: content.picture,
  };
}

export function setAccessJwt(token: string | null) {
  if (browser) {
    localStorage.setItem('waveAccessJwt', token ?? '');
  }
}

export function getAccessJwt() {
  if (browser) {
    return z
      .string()
      .nullable()
      .parse(localStorage.getItem('waveAccessJwt') || null);
  } else {
    return null;
  }
}

export async function getRefreshedAuthToken(manualCookie?: string) {
  const res = await call('/api/auth/token/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: manualCookie ? { Cookie: manualCookie } : {},
  });

  const data = z
    .object({
      accessToken: z.string(),
    })
    .parse(res);

  setAccessJwt(data.accessToken);
  return data.accessToken;
}

export async function redeemGitHubOAuthCode(code: string, state: string) {
  const res = await call('/api/auth/oauth/github/redeem-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, state }),
    credentials: 'include',
  });

  const data = z
    .object({
      accessToken: z.string(),
    })
    .parse(res);

  setAccessJwt(data.accessToken);

  return data.accessToken;
}

export async function logOut() {
  await call('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  setAccessJwt(null);
}
