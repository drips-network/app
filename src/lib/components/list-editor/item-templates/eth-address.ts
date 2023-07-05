import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
import type { ListItem } from '../list-editor.svelte';

const ethAddressItem: (address: string) => ListItem = (address: string) => ({
  type: 'selectable',
  label: {
    component: IdentityBadge,
    props: {
      address,
      size: 'medium',
      disableLink: true,
    },
  },
  editablePercentage: true,
});

export default ethAddressItem;
