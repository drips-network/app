import type { ListItem } from '../list-editor.svelte';

const ethAddressItem: () => ListItem = () => ({
  type: 'address',
});

export default ethAddressItem;
