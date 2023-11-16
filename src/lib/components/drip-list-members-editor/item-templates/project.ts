import type { ListItem } from '../drip-list-members-editor.svelte';
import type { DripListMembersEditorProjectFragment } from '../__generated__/gql.generated';

function projectItem(project: DripListMembersEditorProjectFragment): ListItem {
  return {
    type: 'project',
    project,
  }
};

export default projectItem;
