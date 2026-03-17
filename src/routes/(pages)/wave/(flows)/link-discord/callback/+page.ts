import { error } from '@sveltejs/kit';
import z from 'zod';
import isSafePath from '$lib/utils/safe-path';

export const load = async ({ url }) => {
  const errorParam = url.searchParams.get('error');

  if (errorParam === 'access_denied') {
    return {
      error: 'cancelled',
      returnUrl: '/wave/settings/identity-and-payments',
    };
  }

  let decodedState: string | null = null;
  let stateJson: unknown = null;

  try {
    const stateParam = url.searchParams.get('state');
    if (stateParam) {
      decodedState = atob(stateParam);
      stateJson = JSON.parse(decodedState);
    }
  } catch {
    throw error(400, 'Invalid state parameter encoding');
  }

  const parsedState = z
    .object({
      returnUrl: z.string().optional().nullable(),
    })
    .safeParse(stateJson);

  if (!parsedState.success) {
    throw error(400, 'Invalid state parameter');
  }

  const { returnUrl } = parsedState.data;

  // Validate returnUrl to prevent open redirect attacks
  const safeReturnUrl =
    returnUrl && isSafePath(returnUrl) ? returnUrl : '/wave/settings/identity-and-payments';

  return {
    returnUrl: safeReturnUrl,
  };
};

export const ssr = false;
