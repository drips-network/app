import { getComplimentsForIssue } from '$lib/utils/wave/compliments.js';

const COMPLIMENT_DEADLINE_DAYS = 7;

export const load = async ({ parent, fetch }) => {
  const { issue } = await parent();

  const issueCompletedInCycle = issue.resolvedInCycle;

  if (!issueCompletedInCycle || !issue.waveId) {
    return {
      canMakeCompliment: false,
      reason: 'not-completed',
    };
  }

  const cycleEndDate = issueCompletedInCycle.endDate;
  const canMakeComplimentUntil = new Date(cycleEndDate);
  canMakeComplimentUntil.setDate(canMakeComplimentUntil.getDate() + COMPLIMENT_DEADLINE_DAYS);

  const now = new Date();

  if (now > canMakeComplimentUntil) {
    return {
      canMakeCompliment: false,
      reason: 'deadline-passed',
    };
  }

  const previousCompliments = await getComplimentsForIssue(fetch, issue.waveId, issue.id);

  return {
    canMakeCompliment: true,
    complimentDeadline: canMakeComplimentUntil,
    previousCompliments,
  };
};
