import type { ListItem } from '../drip-list-members-editor.svelte';

const dripListItem = (listName: string, listId: string, owner: string): ListItem => ({
  type: 'drip-list',
  list: {
    id: listId,
    name: listName,
    owner,
  },
});

export default dripListItem;
