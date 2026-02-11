import { authenticatedCall } from './call';
import { toFilterParams } from './types/filter';
import {
  orgFiltersSchema,
  orgMemberDtoSchema,
  orgRepoDtoSchema,
  publicOrgDtoSchema,
  publicOrgsFiltersSchema,
  userOrgDtoSchema,
  type OrgFilters,
  type PublicOrgsFilters,
} from './types/org';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import { getAllPaginated } from './getAllPaginated';
import parseRes from './utils/parse-res';

export async function getOrgs(f = fetch, pagination?: PaginationInput, filters?: OrgFilters) {
  const res = await authenticatedCall(
    f,
    `/api/orgs?${toPaginationParams(pagination)}&${toFilterParams(orgFiltersSchema, filters)}`,
  );

  return parseRes(paginatedResponseSchema(userOrgDtoSchema), res);
}

export async function getOwnRepos(f = fetch, pagination?: PaginationInput) {
  const res = await authenticatedCall(f, `/api/repos?${toPaginationParams(pagination)}`);

  return parseRes(paginatedResponseSchema(orgRepoDtoSchema), res);
}

export async function getPublicOrg(f = fetch, orgId: string) {
  return parseRes(publicOrgDtoSchema, await authenticatedCall(f, `/api/orgs/public/${orgId}`), {
    expect404: true,
  });
}

export async function getOrgMembers(f = fetch, orgId: string) {
  return getAllPaginated(async (page, limit) =>
    parseRes(
      paginatedResponseSchema(orgMemberDtoSchema),
      await authenticatedCall(
        f,
        `/api/orgs/${orgId}/public/members?${toPaginationParams({ page, limit })}`,
      ),
    ),
  );
}

export async function getPublicOrgs(
  f = fetch,
  pagination: PaginationInput = {},
  filters: PublicOrgsFilters = {},
) {
  return parseRes(
    paginatedResponseSchema(publicOrgDtoSchema),
    await authenticatedCall(
      f,
      `/api/orgs/public?${toPaginationParams(pagination)}&${toFilterParams(publicOrgsFiltersSchema, filters)}`,
    ),
  );
}
