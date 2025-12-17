import { authenticatedCall } from './call';
import { toFilterParams } from './types/filter';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import {
  waveDtoSchema,
  waveFiltersSchema,
  waveProgramDtoSchema,
  waveProgramIssueWithDetailsDtoSchema,
  waveProgramRepoWithDetailsDtoSchema,
  type Complexity,
  type WaveFilters,
} from './types/waveProgram';

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

export async function getWavePrograms(f = fetch, pagination?: PaginationInput) {
  const res = await authenticatedCall(f, `/api/wave-programs?${toPaginationParams(pagination)}`);

  return parseRes(paginatedResponseSchema(waveProgramDtoSchema), res);
}

export async function getWaveProgram(f = fetch, waveProgramId: string) {
  return parseRes(
    waveProgramDtoSchema,
    await authenticatedCall(f, `/api/wave-programs/${waveProgramId}`),
    {
      expect404: true,
    },
  );
}

export async function applyRepoToWaveProgram(f = fetch, waveProgramId: string, orgRepoId: string) {
  return parseRes(
    waveProgramRepoWithDetailsDtoSchema,
    await authenticatedCall(f, `/api/wave-programs/${waveProgramId}/repos/${orgRepoId}/apply`, {
      method: 'POST',
    }),
  );
}

export async function getOwnWaveProgramRepos(f = fetch, pagination?: PaginationInput) {
  return parseRes(
    paginatedResponseSchema(waveProgramRepoWithDetailsDtoSchema),
    await authenticatedCall(f, `/api/wave-program-repos?${toPaginationParams(pagination)}`),
  );
}

export async function getWaveProgramRepos(
  f = fetch,
  waveProgramId: string,
  pagination: PaginationInput = {},
) {
  return parseRes(
    paginatedResponseSchema(waveProgramRepoWithDetailsDtoSchema),
    await authenticatedCall(
      f,
      `/api/wave-programs/${waveProgramId}/repos?${toPaginationParams(pagination)}`,
    ),
  );
}

export async function addIssueToWaveProgram(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  complexity: Complexity,
) {
  return parseRes(
    waveProgramIssueWithDetailsDtoSchema,
    await authenticatedCall(f, `/api/wave-programs/${waveProgramId}/issues`, {
      method: 'POST',
      body: JSON.stringify({
        issueId,
        complexity,
      }),
    }),
  );
}

export async function removeIssueFromWaveProgram(
  f = fetch,
  waveProgramId: string,
  issueId: string,
) {
  return await authenticatedCall(f, `/api/wave-programs/${waveProgramId}/issues/${issueId}`, {
    method: 'DELETE',
  });
}

export async function getWaves(
  f = fetch,
  waveProgramId: string,
  pagination: PaginationInput = {},
  filters: WaveFilters = {},
) {
  return parseRes(
    paginatedResponseSchema(waveDtoSchema),
    await authenticatedCall(
      f,
      `/api/wave-programs/${waveProgramId}/waves?${toFilterParams(waveFiltersSchema, filters)}&${toPaginationParams(pagination)}`,
    ),
  );
}

export async function updateWaveProgramIssueComplexity(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  complexity: Complexity,
) {
  return parseRes(
    waveProgramIssueWithDetailsDtoSchema,
    await authenticatedCall(f, `/api/wave-programs/${waveProgramId}/issues/${issueId}/complexity`, {
      method: 'PATCH',
      body: JSON.stringify({
        complexity,
      }),
    }),
  );
}
