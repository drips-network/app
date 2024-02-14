<script lang="ts" context="module">
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
      outline: true,
      size: 'medium',
      disableTooltip: true,
    },
  });
</script>

<script lang="ts">
  import type { DripListBadgeFragment } from '$lib/components/drip-list-badge/__generated__/gql.generated';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import Pile from '$lib/components/pile/pile.svelte';
  import type { ProjectAvatarFragment } from '$lib/components/project-avatar/__generated__/gql.generated';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import type { CellContext } from '@tanstack/svelte-table';
  import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';

  export let context: CellContext<unknown, unknown>;

  let props: any;

  $: {
    props = context.getValue();
  }
</script>

<Pile {...props} />
