<script
  lang="ts"
  generics="TSortByOptions extends { [value: string]: string | null }, TFilterOptions extends { [value: string]: string | null }"
>
  import Download from '../icons/Download.svelte';
  import Filter from '../icons/Filter.svelte';
  import SortMostToLeast from '../icons/SortMostToLeast.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import MiniButton from './components/mini-button.svelte';
  import MiniDropdown from './components/mini-dropdown.svelte';

  export let sortByOptions: TSortByOptions;
  export let sortBy: string | null = null;

  export let filterOptions: TFilterOptions;
  export let filterBy: string | null = null;

  export let loading = false;

  export let el: HTMLDivElement | undefined = undefined;

  export let onDownload: (() => void) | undefined = undefined;
</script>

<div class="table-view-configurator" bind:this={el}>
  {#if loading}
    <Spinner />
  {/if}

  {#if onDownload}
    <MiniButton label="Download CSV" icon={Download} on:click={onDownload} />

    <div class="vertical-divider" />
  {/if}

  <MiniDropdown
    label="Sort by"
    icon={SortMostToLeast}
    options={sortByOptions}
    disabled={loading}
    bind:value={sortBy}
  />
  <MiniDropdown
    label="Filter by"
    icon={Filter}
    options={filterOptions}
    allowNull
    highlightIfSet
    disabled={loading}
    bind:value={filterBy}
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
