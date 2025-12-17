import { authenticatedCall } from './call';
import { toFilterParams } from './types/filter';
import {
  leaderboardEntryDtoSchema,
  leaderboardFiltersSchema,
  type LeaderboardFilters,
} from './types/leaderboard';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import parseRes from './utils/parse-res';

export async function getLeaderboard(
  f = fetch,
  filters: LeaderboardFilters,
  pagination?: PaginationInput,
) {
  return parseRes(
    paginatedResponseSchema(leaderboardEntryDtoSchema),
    await authenticatedCall(
      f,
      `/api/leaderboard?${toPaginationParams(pagination)}&${toFilterParams(leaderboardFiltersSchema, filters)}`,
      {
        method: 'GET',
      },
    ),
  );
}
