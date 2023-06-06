import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
import type { GitProject } from '$lib/utils/metadata/types';
import type { ListItem } from '../list-editor.svelte';

const projectItem: (project: GitProject) => ListItem = (project: GitProject) => ({
  type: 'selectable',
  label: {
    component: ProjectBadge,
    props: {
      project,
      linkTo: 'nothing',
    },
  },
  editablePercentage: {
    initialWeight: 0,
  },
});

export default projectItem;
