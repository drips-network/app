import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
import { inferBadges } from './issues-list-item.svelte';

const ISSUE_ITEM_HEIGHT_SINGLE_LINE = 85; // in px
const ISSUE_ITEM_HEIGHT_DOUBLE_LINE = 110; // in px

const BADGES_ROW_HEIGHT = 24 + 8; // in px (24px for badges height + 8px gap)

export function determineAmountOfLines(issue: IssueDetailsDto): 1 | 2 {
  if (issue.title.length > 50) {
    return 2;
  }

  return 1;
}

export function determineIssuesListItemHeight(
  issue: IssueDetailsDto,
  showNewApplicationsBadge: boolean,
): number {
  const amountOfLines = determineAmountOfLines(issue);

  let base = amountOfLines === 1 ? ISSUE_ITEM_HEIGHT_SINGLE_LINE : ISSUE_ITEM_HEIGHT_DOUBLE_LINE;

  const hasBadges = inferBadges(issue, showNewApplicationsBadge).length > 0;

  if (hasBadges) {
    base += BADGES_ROW_HEIGHT;
  }

  return base;
}
