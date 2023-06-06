import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
import type { ListItem } from '../list-editor.svelte';

const ethAddressItem: (address: string) => ListItem = (address: string) => ({
  type: 'selectable',
  label: {
    component: IdentityBadge,
    props: {
      address,
      showFullAddress: true,
      size: 'medium',
      disableLink: true,
    },
  },
  editablePercentage: {
    initialWeight: 0,
  },
});

export default ethAddressItem;
