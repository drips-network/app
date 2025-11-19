<script lang="ts">
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
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
  };
</script>

<ListSelect
  bind:selected
  items={projectItems}
  searchable={false}
  emptyStateText="You have no claimed projects yet"
/>
