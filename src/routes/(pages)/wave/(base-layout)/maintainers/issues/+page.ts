import { getIssues } from '$lib/utils/wave/issues';

export const load = async ({ fetch }) => {
  const issues = await getIssues(fetch);

  return {
    issues,
  };
};
