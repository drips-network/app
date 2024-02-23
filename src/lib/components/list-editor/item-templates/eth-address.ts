import type { ListItem } from '../list-editor.svelte';

const ethAddressItem: (address: string) => ListItem = (address: string) => ({
  type: 'address',
  address,
});

export default ethAddressItem;
