import type { ListItem } from '../drip-list-members-editor.svelte';

const ethAddressItem: (address: string) => ListItem = (address: string) => ({
  type: 'address',
  address,
});

export default ethAddressItem;
