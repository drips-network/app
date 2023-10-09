import type { GitProject } from '$lib/utils/git-project/types';
import type { ListItem } from '../drip-list-members-editor.svelte';

const projectItem: (project: GitProject) => ListItem = (project: GitProject) => ({
  type: 'project',
  project,
});

export default projectItem;
