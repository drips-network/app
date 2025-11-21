import { browser } from '$app/environment';
import z from 'zod';
import { call } from './call';
import { jwtDecode } from 'jwt-decode';

const accessClaimJwtSchema = z.object({
  iss: z.literal('drips-wave'),
  sub: z.string().uuid(),
  iat: z.number().int(),
  exp: z.number().int(),
  isSuperAdmin: z.boolean(),
  name: z.string(),
  email: z.string().email(),
  picture: z.string().url().optional(),
});

export type WaveUserData = z.infer<typeof accessClaimJwtSchema>;

export function getUserData(jwt: string | null): WaveUserData | null {
  if (!jwt) {
    return null;
  }

  const content = accessClaimJwtSchema.parse(jwtDecode(jwt));

  return content;
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
