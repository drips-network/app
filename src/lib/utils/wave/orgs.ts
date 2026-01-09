import { authenticatedCall } from './call';
import { toFilterParams } from './types/filter';
import { orgFiltersSchema, orgRepoDtoSchema, userOrgDtoSchema, type OrgFilters } from './types/org';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
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
