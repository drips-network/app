<script
  lang="ts"
  generics="TSortByOptions extends _TDropdownOptions, TFilterOptions extends _TDropdownOptions"
>
  import Download from '../icons/Download.svelte';
  import FileCSV from '../icons/FileCSV.svelte';
  import FileXLSX from '../icons/FileXLSX.svelte';
  import Filter from '../icons/Filter.svelte';
  import SortMostToLeast from '../icons/SortMostToLeast.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import MiniDropdown, {
    type TDropdownOptions as _TDropdownOptions,
  } from './components/mini-dropdown.svelte';






  interface Props {
    sortByOptions: TSortByOptions;
    filterOptions: TFilterOptions;
    loading?: boolean;
    el?: HTMLDivElement | undefined;
    onDownload?: ((filetype: 'csv' | 'xlsx') => void) | undefined;
    sortBy?: keyof TSortByOptions | null;
    filterBy?: keyof TFilterOptions | null;
    onFilterChange?: 
    | ((filterBy: keyof TFilterOptions | null, selectFn: () => void) => Promise<void>)
    | undefined;
    onSortChange?: 
    | ((sortBy: keyof TSortByOptions | null, selectFn: () => void) => Promise<void>)
    | undefined;
  }

  let {
    sortByOptions,
    filterOptions,
    loading = false,
    el = $bindable(undefined),
    onDownload = undefined,
    sortBy = null,
    filterBy = null,
    onFilterChange = undefined,
    onSortChange = undefined
  }: Props = $props();

  function handleOptionClick(
    type: 'filter' | 'sort',
    key: keyof TSortByOptions | keyof TFilterOptions,
    selectFn: () => void,
    isSelected: boolean,
  ) {
    if (type === 'filter') {
      if (onFilterChange) {
        const keyToSend = isSelected ? null : (key as keyof TFilterOptions);

        onFilterChange(keyToSend, selectFn);
        return;
      }
    } else {
      if (onSortChange) {
        const keyToSend = isSelected ? null : (key as keyof TSortByOptions);

        onSortChange(keyToSend, selectFn);
        return;
      }
    }

    selectFn();
  }
</script>

<div class="table-view-configurator" bind:this={el}>
  {#if loading}
    <Spinner />
  {/if}

  {#if onDownload}
    <MiniDropdown
      label="Download"
      icon={Download}
      options={{
        csv: { label: 'CSV', icon: FileCSV },
        xlsx: { label: 'Excel (XLSX)', icon: FileXLSX },
      }}
      disabled={loading}
      onOptionClick={(key, selectFn) => {
        onDownload?.(key);
        if (!onDownload) selectFn();
      }}
    />

    <div class="vertical-divider"></div>
  {/if}

  <MiniDropdown
    label="Sort by"
    icon={SortMostToLeast}
    options={sortByOptions}
    disabled={loading}
    value={sortBy}
    onOptionClick={(key, selectFn, isSelected) =>
      handleOptionClick('sort', key, selectFn, isSelected)}
  />
  <MiniDropdown
    label="Filter by"
    icon={Filter}
    options={filterOptions}
    allowNull
    value={filterBy}
    highlightIfSet
    disabled={loading}
    onOptionClick={(key, selectFn, isSelected) =>
      handleOptionClick('filter', key, selectFn, isSelected)}
  />
</div>

<style>
  .table-view-configurator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .vertical-divider {
    width: 1px;
    height: 1.5rem;
    margin: 0 0.5rem;
    background: var(--color-foreground-level-2);
  }
</style>
