import { getReview } from '$lib/utils/wave/reviews.js';

const REVIEW_DEADLINE_DAYS = 14;

export const load = async ({ parent, fetch }) => {
  const { issue, isOwnIssue, user } = await parent();

  if (!issue.gitHubClosedAt || !issue.waveProgramId) {
    return {
      canReview: false as const,
      reason: 'not-completed' as const,
    };
  }

  const reviewDeadline = new Date(issue.gitHubClosedAt);
  reviewDeadline.setDate(reviewDeadline.getDate() + REVIEW_DEADLINE_DAYS);

  const now = new Date();

  if (now > reviewDeadline) {
    return {
      canReview: false as const,
      reason: 'deadline-passed' as const,
      reviewDeadline,
    };
  }

  // Determine role
  let reviewerRole: 'maintainer' | 'contributor' | null = null;

  if (isOwnIssue) {
    reviewerRole = 'maintainer';
  } else if (user.id === issue.assignedApplicant?.id) {
    reviewerRole = 'contributor';
  }

  if (!reviewerRole) {
    return {
      canReview: false as const,
      reason: 'not-authorized' as const,
    };
  }

  const existingReview = await getReview(fetch, issue.waveProgramId, issue.id);

  return {
    canReview: true as const,
    reviewerRole,
    existingReview,
    reviewDeadline,
  };
};
