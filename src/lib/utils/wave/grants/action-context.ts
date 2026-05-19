import { browser } from '$app/environment';
import getOptionalEnvVarPublic from '../../get-optional-env-var/public';
import { cancelWithdrawal, requestTestTransaction, requestWithdrawal } from '../grants';
import type { StellarMemoType } from '../types/grant';

/**
 * Abstracts the four mutating operations the grant detail page + its modal
 * flows perform against a grant. Two implementations:
 *
 * - {@link authenticatedGrantActionContext}: the normal authenticated grant
 *   page targets `/api/grants/:grantId/...` with the user's JWT.
 * - {@link magicLinkSessionGrantActionContext}: the magic-link landing page
 *   targets `/api/grants/magic-links/session/...` with the session cookie.
 *
 * The flows use the same Svelte components for both — only this dependency
 * differs.
 */
export interface GrantActionContext {
  requestTestTransaction(
    stellarAddress: string,
    memoType?: StellarMemoType,
    memoValue?: string,
  ): Promise<unknown>;
  requestWithdrawal(
    stellarAddress: string,
    memoType?: StellarMemoType,
    memoValue?: string,
  ): Promise<unknown>;
  cancelWithdrawal(): Promise<unknown>;
  /** SvelteKit `invalidate()` key to bump after a successful action. */
  invalidateKey: string;
}

export function authenticatedGrantActionContext(grantId: string): GrantActionContext {
  return {
    requestTestTransaction: (stellarAddress, memoType, memoValue) =>
      requestTestTransaction(undefined, grantId, stellarAddress, memoType, memoValue),
    requestWithdrawal: (stellarAddress, memoType, memoValue) =>
      requestWithdrawal(undefined, grantId, stellarAddress, memoType, memoValue),
    cancelWithdrawal: () => cancelWithdrawal(undefined, grantId),
    invalidateKey: 'wave:rewards',
  };
}

const PUBLIC_WAVE_API_URL = getOptionalEnvVarPublic(
  'PUBLIC_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);
const INTERNAL_WAVE_API_URL = getOptionalEnvVarPublic(
  'PUBLIC_INTERNAL_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);

const WAVE_API_URL = browser ? PUBLIC_WAVE_API_URL : INTERNAL_WAVE_API_URL;

async function magicLinkSessionCall(path: string, init: RequestInit = {}): Promise<Response> {
  if (!WAVE_API_URL) {
    throw new Error('Wave API URL is not configured.');
  }
  const res = await fetch(`${WAVE_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API call failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return res;
}

export function magicLinkSessionGrantActionContext(): GrantActionContext {
  function bodyFor(stellarAddress: string, memoType?: StellarMemoType, memoValue?: string): string {
    return JSON.stringify({
      stellarAddress,
      ...(memoType && memoValue ? { memoType, memoValue } : {}),
    });
  }

  return {
    requestTestTransaction: (stellarAddress, memoType, memoValue) =>
      magicLinkSessionCall('/api/grants/magic-links/session/test-transaction', {
        method: 'POST',
        body: bodyFor(stellarAddress, memoType, memoValue),
      }),
    requestWithdrawal: (stellarAddress, memoType, memoValue) =>
      magicLinkSessionCall('/api/grants/magic-links/session/withdraw', {
        method: 'POST',
        body: bodyFor(stellarAddress, memoType, memoValue),
      }),
    cancelWithdrawal: () =>
      magicLinkSessionCall('/api/grants/magic-links/session/cancel-withdrawal', {
        method: 'POST',
      }),
    invalidateKey: 'wave:magic-link-session',
  };
}

export async function exchangeMagicLinkToken(token: string): Promise<void> {
  await magicLinkSessionCall('/api/grants/magic-links/exchange', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function logoutMagicLinkSession(): Promise<void> {
  await magicLinkSessionCall('/api/grants/magic-links/session/logout', {
    method: 'POST',
  });
}
