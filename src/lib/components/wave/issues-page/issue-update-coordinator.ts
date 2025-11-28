/** One might call this awkward, but it's required to pass notifications about issues being updated from the
 * single-issue-page component to the issues-list component with its complicated endless scrolling...
 */

import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';

let listeners: Array<(updatedIssues: IssueDetailsDto[]) => void> = [];

export function registerIssueUpdateListener(listener: (updatedIssues: IssueDetailsDto[]) => void) {
  listeners.push(listener);
}

export function unregisterIssueUpdateListener(
  listener: (updatedIssues: IssueDetailsDto[]) => void,
) {
  listeners = listeners.filter((l) => l !== listener);
}

export function notifyIssuesUpdated(updatedIssues: IssueDetailsDto[]) {
  for (const listener of listeners) {
    listener(updatedIssues);
  }
}
