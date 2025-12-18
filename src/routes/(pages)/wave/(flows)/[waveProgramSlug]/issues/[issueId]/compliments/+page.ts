import { getComplimentsForIssue } from '$lib/utils/wave/compliments.js';

const COMPLIMENT_DEADLINE_DAYS = 7;

export const load = async ({ parent, fetch }) => {
  const { issue, isOwnIssue } = await parent();

  const issueCompletedInWave = issue.resolvedInWave;

  if (!issueCompletedInWave || !issue.waveProgramId) {
    return {
      canMakeCompliment: false,
      reason: 'not-completed',
    };
  }

  const waveEndDate = issueCompletedInWave.endDate;
  const canMakeComplimentUntil = new Date(waveEndDate);
  canMakeComplimentUntil.setDate(canMakeComplimentUntil.getDate() + COMPLIMENT_DEADLINE_DAYS);

  const now = new Date();

  if (now > canMakeComplimentUntil) {
    return {
      canMakeCompliment: false,
      reason: 'deadline-passed',
    };
  }

  if (!isOwnIssue) {
    return {
      canMakeCompliment: false,
      reason: 'not-maintainer',
    };
  }

  const previousCompliments = await getComplimentsForIssue(fetch, issue.waveProgramId, issue.id);

  return {
    canMakeCompliment: true,
    complimentDeadline: canMakeComplimentUntil,
    previousCompliments,
  };
};
