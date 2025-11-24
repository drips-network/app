import { authenticatedCall } from './call';
import { toFilterParams } from './types/filter';
import { issueDetailsDtoSchema, issueFilters, type IssueFilters } from './types/issue';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import parseRes from './utils/parse-res';

export async function getIssues(f = fetch, pagination?: PaginationInput, filters?: IssueFilters) {
  return parseRes(
    paginatedResponseSchema(issueDetailsDtoSchema),
    await authenticatedCall(
      f,
      `/api/issues?${toPaginationParams(pagination)}&${toFilterParams(issueFilters, filters)}`,
    ),
  );
}
