import type { DripListMembersEditorDripListFragment } from '../__generated__/gql.generated';
import type { ListItem } from '../drip-list-members-editor.svelte';

const dripListItem = (dripList: DripListMembersEditorDripListFragment): ListItem => ({
  type: 'drip-list',
  list: dripList,
});

export default dripListItem;
