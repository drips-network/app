import { describe, expect, it } from 'vitest';
import { reposIssuesEnabledResponseSchema } from './org';

describe('reposIssuesEnabledResponseSchema', () => {
  it('accepts enabled, disabled and inconclusive statuses', () => {
    const parsed = reposIssuesEnabledResponseSchema.parse({
      data: [
        {
          orgRepoId: '770e8400-e29b-41d4-a716-446655440002',
          gitHubRepoFullName: 'acme/enabled',
          issuesEnabled: true,
        },
        {
          orgRepoId: '770e8400-e29b-41d4-a716-446655440003',
          gitHubRepoFullName: 'acme/disabled',
          issuesEnabled: false,
        },
        {
          orgRepoId: '770e8400-e29b-41d4-a716-446655440004',
          gitHubRepoFullName: 'acme/unknown',
          issuesEnabled: null,
        },
      ],
    });

    expect(parsed.data.map((r) => r.issuesEnabled)).toEqual([true, false, null]);
  });

  it('rejects a missing issuesEnabled field, so an unknown answer cannot pass as enabled', () => {
    expect(() =>
      reposIssuesEnabledResponseSchema.parse({
        data: [
          {
            orgRepoId: '770e8400-e29b-41d4-a716-446655440002',
            gitHubRepoFullName: 'acme/enabled',
          },
        ],
      }),
    ).toThrow();
  });
});
