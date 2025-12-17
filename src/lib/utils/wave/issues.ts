import { authenticatedCall } from './call';
import { toFilterParams } from './types/filter';
import {
  issueDetailsDtoSchema,
  issueFilters,
  type IssueFilters,
  type IssueSortByOption,
} from './types/issue';
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
import { marked } from 'marked';
import sanitize from 'sanitize-html';

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
      `/api/wave-programs/${waveProgramId}/issues/${issueId}/applications?${toPaginationParams(pagination)}&${toFilterParams(issueApplicationFiltersSchema, filters)}`,
    ),
  );
}

export async function applyToWorkOnIssue(
  f = fetch,
  waveProgramId: string,
  issueId: string,
  applicationText: string,
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
    (issue) => issue?.state === 'completed',
    10000,
    500,
  );

  if (expectation.failed) {
    throw new Error('Timed out waiting for issue to be marked as completed.');
  }

  return expectation.result;
}

export function renderIssueTitle(title: string): string {
  marked.use({
    renderer: {
      codespan({ text }) {
        return `<code style="font-family: var(--typeface-mono-regular); color: var(--color-foreground-level-6); border-radius: 4px; padding: 0.2rem 0.4rem 0 0.4rem; background-color: var(--color-foreground-level-2);">${text}</code>`;
      },
    },
  });

  const markup = marked(title, { async: false });

  return sanitize(markup, {
    allowedTags: ['code'],
    allowedAttributes: {
      code: ['style'],
    },
  });
}
