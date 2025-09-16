<script lang="ts">
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import type { ApplicationCategory } from '$lib/utils/rpgf/types/application';

  export let categories: ApplicationCategory[];
  export let selected: string[] = [];

  let categoryItems: Items;
  $: categoryItems = Object.fromEntries(
    categories.map((category) => {
      return [
        category.id,
        {
          type: 'selectable',
          label: category.name,
          searchString: [category.name, category.description || ''],
        },
      ];
    }),
  );
</script>

<ListSelect bind:selected items={categoryItems} searchable={false} />
