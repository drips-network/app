import { authenticatedCall } from './call';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import {
  waveDtoSchema,
  waveIssueWithDetailsDtoSchema,
  waveRepoWithDetailsDtoSchema,
  type Complexity,
} from './types/wave';
import parseRes from './utils/parse-res';

export function beComplexityToFriendlyLabel(complexity: Complexity) {
  switch (complexity) {
    case 'small':
      return 'Trivial';
    case 'medium':
      return 'Medium';
    case 'large':
      return 'High';
  }
}

export async function getWaves(f = fetch, pagination?: PaginationInput) {
  const res = await authenticatedCall(f, `/api/waves?${toPaginationParams(pagination)}`);

  return parseRes(paginatedResponseSchema(waveDtoSchema), res);
}

export async function getWave(f = fetch, waveId: string) {
  return parseRes(waveDtoSchema, await authenticatedCall(f, `/api/waves/${waveId}`), {
    expect404: true,
  });
}

export async function applyRepoToWave(f = fetch, waveId: string, orgRepoId: string) {
  return parseRes(
    waveRepoWithDetailsDtoSchema,
    await authenticatedCall(f, `/api/waves/${waveId}/repos/${orgRepoId}/apply`, {
      method: 'POST',
    }),
  );
}

export async function getOwnWaveRepos(f = fetch, pagination?: PaginationInput) {
  return parseRes(
    paginatedResponseSchema(waveRepoWithDetailsDtoSchema),
    await authenticatedCall(f, `/api/wave-repos?${toPaginationParams(pagination)}`),
  );
}

export async function addIssueToWave(
  f = fetch,
  waveId: string,
  issueId: string,
  complexity: Complexity,
) {
  return parseRes(
    waveIssueWithDetailsDtoSchema,
    await authenticatedCall(f, `/api/waves/${waveId}/issues`, {
      method: 'POST',
      body: JSON.stringify({
        issueId,
        complexity,
      }),
    }),
  );
}

export async function removeIssueFromWave(f = fetch, waveId: string, issueId: string) {
  return await authenticatedCall(f, `/api/waves/${waveId}/issues/${issueId}`, {
    method: 'DELETE',
  });
}
