import buildUrl from '$lib/utils/build-url.js';
import {
  getApplicationCategories,
  getApplications,
  getExternalVoteResult,
  getRound,
} from '$lib/utils/rpgf/rpgf.js';
import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch, parent }) => {
  const { rpgfUserData } = await parent();

  const externalVoteResultId = url.searchParams.get('externalVoteResultId');
  const roundId = url.searchParams.get('roundId');

  if (!externalVoteResultId || !roundId) {
    throw error(400, 'Missing externalVoteResultId or roundId query parameter');
  }

  if (!rpgfUserData) {
    throw redirect(
      307,
      buildUrl('/app/connect', {
        requireRpgfSignIn: 'true',
        backTo: url.pathname + url.search,
      }),
    );
  }

  const round = await getRound(fetch, roundId);
  if (!round) {
    throw error(404, 'Round not found');
  }

  let externalVoteResult: Awaited<ReturnType<typeof getExternalVoteResult>>;
  try {
    externalVoteResult = await getExternalVoteResult(fetch, roundId, externalVoteResultId);
  } catch {
    throw error(
      404,
      'External vote result not found. The link may have expired or already been used.',
    );
  }

  const [categories, applications] = await Promise.all([
    getApplicationCategories(fetch, round.id),
    getApplications(
      fetch,
      round.id,
      100000,
      0,
      undefined,
      null,
      'approved',
      externalVoteResult.categoryId,
    ),
  ]);

  const category = categories.find((c) => c.id === externalVoteResult.categoryId) ?? null;

  return {
    round,
    externalVoteResult,
    category,
    applications,
  };
};

export const ssr = false;
