import z from 'zod';
import { authenticatedCall, call } from './call';
import { jwtDecode } from 'jwt-decode';
import type { WaveUser } from './types/user';
import parseRes from './utils/parse-res';
import { invalidateAll } from '$app/navigation';
import { browser } from '$app/environment';

const accessClaimJwtSchema = z.object({
  iss: z.literal('drips-wave'),
  sub: z.uuid(),
  iat: z.number().int(),
  exp: z.number().int(),
  name: z.string(),
  email: z.email(),
  picture: z.url(),
  signUpDate: z.coerce.date(),
  payoutAddresses: z
    .object({
      stellar: z.string().nullable(),
    })
    .optional(),
  permissions: z.array(z.string()).optional(),
});

export type WaveLoggedInUser = WaveUser & {
  name: string;
  email: string;
  avatarUrl: string;
  payoutAddresses?: {
    stellar: string | null;
  };
  signUpDate: Date;
  permissions?: string[];
};

export function getAccessTokenCookieClientSide(): string | null {
  if (!browser) return null;
  const match = document.cookie.match(new RegExp('(^| )wave_access_token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const EXPIRY_BUFFER_SECONDS = 30; // Refresh if expiring within 30 seconds

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
  if (content.exp < now + EXPIRY_BUFFER_SECONDS) {
    return null;
  }

  return {
    id: content.sub,
    gitHubUsername: content.name,
    name: content.name,
    gitHubAvatarUrl: content.picture,
    email: content.email,
    avatarUrl: content.picture,
    signUpDate: content.signUpDate,
    payoutAddresses: content.payoutAddresses,
    permissions: content.permissions,
  };
}

export async function getRefreshedAuthToken(manualCookie?: string) {
  try {
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

    return data.accessToken;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to refresh auth token:', e);

    await logOut();
    await invalidateAll();

    return null;
  }
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

  return data;
}

export async function logOut() {
  await call('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
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
