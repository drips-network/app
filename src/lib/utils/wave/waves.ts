import { authenticatedCall } from './call';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import { waveDtoSchema, waveRepoWithDetailsDtoSchema } from './types/wave';
import parseRes from './utils/parse-res';

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
