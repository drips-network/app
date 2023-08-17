import type { GitProject } from '$lib/utils/metadata/types';
import type { ListItem } from '../list-editor.svelte';

const projectItem: (project: GitProject) => ListItem = (project: GitProject) => ({
  type: 'project',
  project,
});

export default projectItem;
