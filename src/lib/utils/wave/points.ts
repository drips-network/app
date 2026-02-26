import { authenticatedCall } from './call';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import { pointsDtoSchema, pointsLedgerEntryDtoSchema } from './types/points';
import parseRes from './utils/parse-res';

export async function getOwnPointsBalance(
  f = fetch,
  options?: { scope?: 'all-time' | 'current-waves' },
) {
  const params = options?.scope ? `?scope=${options.scope}` : '';
  return parseRes(pointsDtoSchema, await authenticatedCall(f, `/api/points/balance${params}`));
}

export async function getPointsBalanceForUser(f = fetch, userId: string) {
  return parseRes(pointsDtoSchema, await authenticatedCall(f, `/api/points/balance/${userId}`), {
    expect404: true,
  });
}

export async function adjustPoints(
  f = fetch,
  {
    userId,
    points,
    reason,
    waveId,
  }: { userId: string; points: number; reason: string; waveId: string },
) {
  return authenticatedCall(f, '/api/points/adjust', {
    method: 'POST',
    body: JSON.stringify({ userId, points, reason, waveId }),
  });
}

export async function getOwnPointsHistory(f = fetch, pagination?: PaginationInput) {
  return parseRes(
    paginatedResponseSchema(pointsLedgerEntryDtoSchema),
    await authenticatedCall(f, `/api/points/history?${toPaginationParams(pagination)}`),
  );
}
