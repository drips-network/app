import { authenticatedCall } from './call';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import { pointsDtoSchema, pointsLedgerEntryDtoSchema } from './types/points';
import parseRes from './utils/parse-res';

export async function getOwnPointsBalance(f = fetch) {
  return parseRes(pointsDtoSchema, await authenticatedCall(f, `/api/points/balance`));
}

export async function getPointsBalanceForUser(f = fetch, userId: string) {
  return parseRes(pointsDtoSchema, await authenticatedCall(f, `/api/points/balance/${userId}`));
}

export async function getOwnPointsHistory(f = fetch, pagination?: PaginationInput) {
  return parseRes(
    paginatedResponseSchema(pointsLedgerEntryDtoSchema),
    await authenticatedCall(f, `/api/points/history?${toPaginationParams(pagination)}`),
  );
}
