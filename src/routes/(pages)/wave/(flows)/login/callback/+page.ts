import { error, redirect } from '@sveltejs/kit';

import performLogin from './perform-login.js';
import z from 'zod';

export const load = async ({ url }) => {
  await performLogin(url);

  // state param is a base 64 encoded JSON string
  const decodedState = url.searchParams.get('state')
    ? atob(url.searchParams.get('state') || '')
    : null;
  const stateJson = decodedState ? JSON.parse(decodedState) : null;

  const parsedState = z
    .object({
      backTo: z.string().optional().nullable(),
    })
    .safeParse(stateJson);

  if (!parsedState.success) {
    throw error(400, 'Invalid state parameter');
  }

  return redirect(302, `/wave/login?backTo=${parsedState.data.backTo || ''}`);
};

export const ssr = false;
