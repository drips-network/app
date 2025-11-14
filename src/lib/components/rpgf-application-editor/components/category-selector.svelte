<script lang="ts">
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import type { ApplicationCategory } from '$lib/utils/rpgf/types/application';

  interface Props {
    categories: ApplicationCategory[];
    selected?: string[];
  }

  let { categories, selected = $bindable([]) }: Props = $props();

  let categoryItems: Items = $derived(Object.fromEntries(
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
  ));
  
</script>

<ListSelect bind:selected items={categoryItems} searchable={false} />
