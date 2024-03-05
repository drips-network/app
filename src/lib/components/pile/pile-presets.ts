import type { DripListBadgeFragment } from '../drip-list-badge/__generated__/gql.generated';
import DripListBadge from '../drip-list-badge/drip-list-badge.svelte';
import IdentityBadge from '../identity-badge/identity-badge.svelte';
import type { ProjectAvatarFragment } from '../project-avatar/__generated__/gql.generated';
import ProjectAvatar from '../project-avatar/project-avatar.svelte';

export const dripListIcon = (dripList: DripListBadgeFragment) => ({
  component: DripListBadge,
  props: {
    dripList,
    showOwner: false,
    showName: false,
    outline: true,
  },
});

export const projectIcon = (project: ProjectAvatarFragment) => ({
  component: ProjectAvatar,
  props: {
    project,
    outline: true,
    size: 'small',
  },
});

export const addressIcon = (address: string) => ({
  component: IdentityBadge,
  props: {
    address,
    showIdentity: false,
    size: 'medium',
    disableTooltip: true,
  },
});
