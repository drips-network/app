import { authenticatedCall } from './call';
import { toFilterParams } from './types/filter';
import {
  issueDetailsDtoSchema,
  issueFilters,
  type IssueFilters,
  type IssueSortByOption,
} from './types/issue';
import {
  applicationQuotaDtoSchema,
  issueApplicationFiltersSchema,
  issueApplicationWithDetailsDtoSchema,
  quotaDetailsDtoSchema,
  type IssueApplicationFilters,
} from './types/issue-application';
import {
  paginatedResponseSchema,
  toPaginationParams,
  type PaginationInput,
} from './types/pagination';
import parseRes from './utils/parse-res';
import expect from '$lib/utils/expect';

export { renderIssueTitle } from './render-issue-title';

export async function getIssues(
  f = fetch,
  pagination?: PaginationInput,
  filters?: IssueFilters,
  sortBy?: IssueSortByOption,
) {
  return parseRes(
    paginatedResponseSchema(issueDetailsDtoSchema),
    await authenticatedCall(
      f,
      `/api/issues?${toPaginationParams(pagination)}&${toFilterParams(issueFilters, filters)}${sortBy ? `&sortBy=${sortBy}` : ''}`,
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
  waveProgramId: string,
  issueId: string,
  pagination?: PaginationInput,
  filters?: IssueApplicationFilters,
) {
  return parseRes(
    paginatedResponseSchema(issueApplicationWithDetailsDtoSchema),
    await authenticatedCall(
      f,
      `/api/wave-programs/${waveProgramId}/issues/${issueId}/applications?${toPaginationParams(pagination)}&${toFilterParams(issueApplicationFiltersSchema, filters)}&sortBy=createdAt&sortOrder=asc`,
    ),
  );
}

export async function getApplicationQuota(f = fetch, waveProgramId: string) {
  return parseRes(
    applicationQuotaDtoSchema,
    await authenticatedCall(f, `/api/wave-programs/${waveProgramId}/quotas/applications`),
  );
}

export async function getApplicationQuotaDetails(f = fetch, waveProgramId: string) {
  return parseRes(
    quotaDetailsDtoSchema,
    await authenticatedCall(f, `/api/wave-programs/${waveProgramId}/quotas/applications/details`),
  );
}

export async function getOrgAssignmentQuota(f = fetch, waveProgramId: string, orgId: string) {
  return parseRes(
    applicationQuotaDtoSchema,
    await authenticatedCall(
      f,
      `/api/wave-programs/${waveProgramId}/quotas/same-contributor/${orgId}`,
    ),
  );
}

export async function applyToWorkOnIssue(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  applicationText: string,
  turnstileToken?: string,
) {
  return parseRes(
    issueApplicationWithDetailsDtoSchema,
    await authenticatedCall(
      f,
      `/api/wave-programs/${waveProgramId}/issues/${issueId}/applications`,
      {
        method: 'POST',
        body: JSON.stringify({
          applicationText,
        }),
        headers: turnstileToken ? { 'x-turnstile-token': turnstileToken } : {},
      },
    ),
  );
}

export async function acceptIssueApplication(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  applicationId: string,
) {
  return parseRes(
    issueApplicationWithDetailsDtoSchema,
    await authenticatedCall(
      f,
      `/api/wave-programs/${waveProgramId}/issues/${issueId}/applications/${applicationId}/accept`,
      {
        method: 'POST',
      },
    ),
  );
}

export async function withdrawIssueApplication(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  applicationId: string,
) {
  return parseRes(
    issueApplicationWithDetailsDtoSchema,
    await authenticatedCall(
      f,
      `/api/wave-programs/${waveProgramId}/issues/${issueId}/applications/${applicationId}/withdraw`,
      {
        method: 'POST',
      },
    ),
  );
}

export async function editIssueApplication(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  applicationId: string,
  applicationText: string,
) {
  return parseRes(
    issueApplicationWithDetailsDtoSchema,
    await authenticatedCall(
      f,
      `/api/wave-programs/${waveProgramId}/issues/${issueId}/applications/${applicationId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ applicationText }),
      },
    ),
  );
}

export async function rejectIssueApplication(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  applicationId: string,
) {
  return parseRes(
    issueApplicationWithDetailsDtoSchema,
    await authenticatedCall(
      f,
      `/api/wave-programs/${waveProgramId}/issues/${issueId}/applications/${applicationId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
    ),
  );
}

export async function unassignContributorFromIssue(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  applicationId: string,
) {
  return await authenticatedCall(
    f,
    `/api/wave-programs/${waveProgramId}/issues/${issueId}/applications/${applicationId}/unassign`,
    {
      method: 'POST',
    },
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
    (issue) => issue?.state === 'closed' || issue?.state === 'completed',
    30000,
    500,
  );

  if (expectation.failed) {
    throw new Error('Timed out waiting for issue to be marked as completed.');
  }

  return expectation.result;
}
