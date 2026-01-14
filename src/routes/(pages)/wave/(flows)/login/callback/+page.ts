import { error, redirect } from '@sveltejs/kit';

import performLogin from './perform-login.js';
import z from 'zod';
import isSafePath from '$lib/utils/safe-path';

export const load = async ({ url }) => {
  const { newUser } = await performLogin(url);

  // state param is a base 64 encoded JSON string
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
      backTo: z.string().optional().nullable(),
      skipWelcome: z.boolean().optional(),
    })
    .safeParse(stateJson);

  if (!parsedState.success) {
    throw error(400, 'Invalid state parameter');
  }

  const { backTo, skipWelcome } = parsedState.data;

  // Validate backTo to prevent open redirect attacks
  const safeBackTo = backTo && isSafePath(backTo) ? backTo : '';

  if (newUser && !skipWelcome) {
    return redirect(302, `/wave/welcome?backTo=${encodeURIComponent(safeBackTo)}`);
  }

  return redirect(302, `/wave/login?backTo=${encodeURIComponent(safeBackTo)}`);
};

export const ssr = false;
