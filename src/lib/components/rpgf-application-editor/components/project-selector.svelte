<script lang="ts">
  import Plus from '$lib/components/icons/Plus.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';
  import modal from '$lib/stores/modal';
  import type { RpgfApplicationEditorProjectFragment } from '../__generated__/gql.generated';

  export let projects: RpgfApplicationEditorProjectFragment[];
  export let selected: string[] = [];

  let projectItems: Items;
  $: projectItems = {
    ...Object.fromEntries(
      projects.map((project) => {
        return [
          project.account.accountId,
          {
            type: 'selectable',
            label: {
              component: ProjectBadge,
              props: {
                project,
                tooltip: false,
                linkToNewTab: true,
              },
            },
            searchString: [...Object.values(project.source)],
          },
        ];
      }),
    ),
    'claim-project': {
      type: 'action',
      label: 'Claim new project',
      image: {
        component: Plus,
        props: {},
      },
      handler: () =>
        modal.show(ClaimProjectStepper, undefined, {
          skipWalletConnect: true,
          linkToProjectPageOnSuccess: false,
          skipNetworkSelection: true,
        }),
    },
  };
</script>

<ListSelect bind:selected items={projectItems} searchable={false} />
