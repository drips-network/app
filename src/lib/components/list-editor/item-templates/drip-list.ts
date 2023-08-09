import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
import type { ListItem } from '../list-editor.svelte';

const dripListItem = (listName: string, listId: string, owner: string): ListItem => ({
  type: 'selectable',
  label: {
    component: DripListBadge,
    props: {
      listName,
      listId,
      owner,
    },
  },
  editablePercentage: true,
});

export default dripListItem;
