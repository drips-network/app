import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';

const ISSUE_ITEM_HEIGHT_SINGLE_LINE = 80; // in px
const ISSUE_ITEM_HEIGHT_DOUBLE_LINE = 105; // in px

export function determineAmountOfLines(issue: IssueDetailsDto): 1 | 2 {
  if (issue.title.length > 50) {
    return 2;
  }

  return 1;
}

export function determineIssuesListItemHeight(issue: IssueDetailsDto): number {
  const amountOfLines = determineAmountOfLines(issue);

  if (amountOfLines === 1) {
    return ISSUE_ITEM_HEIGHT_SINGLE_LINE;
  } else {
    return ISSUE_ITEM_HEIGHT_DOUBLE_LINE;
  }
}
