import type { Project } from '$lib/graphql/generated/graphql';
import type { ListItem } from '../drip-list-members-editor.svelte';

const projectItem: (project: Project) => ListItem = (project: Project) => ({
  type: 'project',
  project,
});

export default projectItem;
