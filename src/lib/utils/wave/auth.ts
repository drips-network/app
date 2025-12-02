import { browser } from '$app/environment';
import z from 'zod';
import { authenticatedCall, call } from './call';
import { jwtDecode } from 'jwt-decode';
import type { WaveUser } from './types/user';
import parseRes from './utils/parse-res';

const accessClaimJwtSchema = z.object({
  iss: z.literal('drips-wave'),
  sub: z.uuid(),
  iat: z.number().int(),
  exp: z.number().int(),
  isSuperAdmin: z.boolean(),
  name: z.string(),
  email: z.email(),
  picture: z.url(),
  signUpDate: z.coerce.date(),
});

export type WaveLoggedInUser = WaveUser & {
  name: string;
  email: string;
  avatarUrl: string;
  isSuperAdmin: boolean;
  signUpDate: Date;
};

export function getUserData(jwt: string | null): WaveLoggedInUser | null {
  if (!jwt) {
    return null;
  }

  const parsed = accessClaimJwtSchema.safeParse(jwtDecode(jwt));

  // maybe we added a new claim, in this case the user needs to refresh the token
  // usually does not require a re-login as the refresh token is still valid
  if (!parsed.success) {
    return null;
  }

  const { data: content } = parsed;

  const now = Math.floor(Date.now() / 1000);
  if (content.exp < now) {
    return null;
  }

  return {
    id: content.sub,
    gitHubUsername: content.name,
    name: content.name,
    gitHubAvatarUrl: content.picture,
    email: content.email,
    isSuperAdmin: content.isSuperAdmin,
    avatarUrl: content.picture,
    signUpDate: content.signUpDate,
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
      newUser: z.boolean(),
    })
    .parse(res);

  setAccessJwt(data.accessToken);

  return data;
}

export async function logOut() {
  await call('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  setAccessJwt(null);
}

export async function getIntercomJwt() {
  return parseRes(
    z.object({
      token: z.string(),
    }),
    await authenticatedCall(undefined, '/api/user/intercom-identity'),
  );
}

export async function getNovuHmac() {
  return parseRes(
    z.object({
      hmacHash: z.string(),
    }),
    await authenticatedCall(undefined, '/api/user/novu-identity'),
  );
}
