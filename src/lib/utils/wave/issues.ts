import { authenticatedCall } from './call';
import { toFilterParams } from './types/filter';
import { issueDetailsDtoSchema, issueFilters, type IssueFilters } from './types/issue';
import {
  issueApplicationFiltersSchema,
  issueApplicationWithDetailsDtoSchema,
  type IssueApplicationFilters,
} from './types/issue-application';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import parseRes from './utils/parse-res';
import expect from '$lib/utils/expect';

export async function getIssues(f = fetch, pagination?: PaginationInput, filters?: IssueFilters) {
  return parseRes(
    paginatedResponseSchema(issueDetailsDtoSchema),
    await authenticatedCall(
      f,
      `/api/issues?${toPaginationParams(pagination)}&${toFilterParams(issueFilters, filters)}`,
    ),
  );
}

export async function getIssue(f = fetch, issueId: string) {
  return parseRes(issueDetailsDtoSchema, await authenticatedCall(f, `/api/issues/${issueId}`), {
    expect404: true,
  });
}

export async function getIssueApplications(
  f = fetch,
  waveId: string,
  issueId: string,
  pagination?: PaginationInput,
  filters?: IssueApplicationFilters,
) {
  return parseRes(
    paginatedResponseSchema(issueApplicationWithDetailsDtoSchema),
    await authenticatedCall(
      f,
      `/api/waves/${waveId}/issues/${issueId}/applications?${toPaginationParams(pagination)}&${toFilterParams(issueApplicationFiltersSchema, filters)}`,
    ),
  );
}

export async function applyToWorkOnIssue(
  f = fetch,
  waveId: string,
  issueId: string,
  applicationText: string,
) {
  return parseRes(
    issueApplicationWithDetailsDtoSchema,
    await authenticatedCall(f, `/api/waves/${waveId}/issues/${issueId}/applications`, {
      method: 'POST',
      body: JSON.stringify({
        applicationText,
      }),
    }),
  );
}

export async function acceptIssueApplication(
  f = fetch,
  waveId: string,
  issueId: string,
  applicationId: string,
) {
  return parseRes(
    issueApplicationWithDetailsDtoSchema,
    await authenticatedCall(
      f,
      `/api/waves/${waveId}/issues/${issueId}/applications/${applicationId}/accept`,
      {
        method: 'POST',
      },
    ),
  );
}

export async function markIssueAsCompleted(f = fetch, issueId: string) {
  // endpoint does not immediately return updated issue bc that happens through webhook
  await authenticatedCall(f, `/api/issues/${issueId}/complete`, {
    method: 'POST',
  });

  // wait for the updated issue
  const expectation = await expect(
    () => getIssue(f, issueId),
    (issue) => issue?.state === 'completed',
    10000,
    500,
  );

  if (expectation.failed) {
    throw new Error('Timed out waiting for issue to be marked as completed.');
  }

  return expectation.result;
}
