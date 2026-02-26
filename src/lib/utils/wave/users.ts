import { authenticatedCall } from './call';
import { paginatedResponseSchema, toPaginationParams } from './types/pagination';
import {
  waveUserDetailDtoSchema,
  userCodeMetricsDtoSchema,
  userPublicOrgDtoSchema,
} from './types/user';
import { getAllPaginated } from './getAllPaginated';
import parseRes from './utils/parse-res';

export async function getUser(f = fetch, userIdOrUsername: string) {
  return parseRes(
    waveUserDetailDtoSchema,
    await authenticatedCall(f, `/api/users/${userIdOrUsername}`),
    {
      expect404: true,
    },
  );
}

export async function getUserOrgs(f = fetch, userId: string) {
  return getAllPaginated(async (page, limit) =>
    parseRes(
      paginatedResponseSchema(userPublicOrgDtoSchema),
      await authenticatedCall(
        f,
        `/api/users/${userId}/orgs?${toPaginationParams({ page, limit })}`,
      ),
    ),
  );
}

export async function getUserCodeMetrics(f = fetch, userId: string) {
  return parseRes(
    userCodeMetricsDtoSchema,
    await authenticatedCall(f, `/api/users/${userId}/code-metrics`),
    {
      expect404: true,
    },
  );
}
