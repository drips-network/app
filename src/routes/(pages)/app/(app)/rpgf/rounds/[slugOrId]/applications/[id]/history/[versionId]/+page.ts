import { error } from '@sveltejs/kit';
import { fetchProjectForApplication } from '../../shared/fetch-project-for-application.js';

export const load = async ({ parent, params, fetch }) => {
  const { history } = await parent();
  const entry = history.find((h) => h.id === params.versionId);
  if (!entry) {
    throw error(404, 'History entry not found');
  }

  const project = await fetchProjectForApplication(fetch, entry.dripsAccountId);
  if (!project) {
    throw error(500, 'Project not found');
  }

  return {
    historyEntry: entry,
    project,
  };
};
