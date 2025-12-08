import z from 'zod';
import { authenticatedCall } from './call';
import parseRes from './utils/parse-res';

export enum WORKFLOW_ID {
  WELCOME = 'welcome',
  REPO_APPLIED_TO_WAVE = 'repo-applied-to-wave',
  REPO_APPLICATION_APPROVED = 'repo-approved-for-wave',
  REPO_APPLICATION_REJECTED = 'repo-declined-for-wave',
  ISSUE_APPLICATION_RECEIVED = 'issue-application-received',
  ISSUE_APPLICATION_APPROVED = 'issue-application-approved',
  COMPLIMENT_RECEIVED = 'compliment-received',
  CONTRIBUTOR_UNASSIGNED = 'contributor-unassigned',
  CONTRIBUTOR_WITHDREW = 'contributor-withdrew',
  ORG_ISSUE_APPLICATION_RECEIVED = 'org-issue-application-received',
  ISSUE_POINTS_RECEIVED = 'issue-points-received',
}

export async function getNotificationPreferences(f = fetch) {
  return parseRes(
    z.object({
      preferences: z.array(
        z.object({
          workflowId: z.enum(Object.values(WORKFLOW_ID)).or(z.string()),
          channels: z.object({
            email: z.boolean(),
            inApp: z.boolean(),
          }),
        }),
      ),
    }),
    await authenticatedCall(f, `/api/user/preferences`),
  );
}

export async function patchNotificationPreference(
  f = fetch,
  workflowId: WORKFLOW_ID,
  channels: {
    email?: boolean;
    inApp?: boolean;
  },
) {
  await authenticatedCall(f, `/api/user/preferences/${workflowId}`, {
    method: 'PUT',
    body: JSON.stringify({ channels }),
  });
}
