<script context="module" lang="ts">
  export interface RowClickEventPayload {
    rowIndex: number;
  }
</script>

<script lang="ts">
  import { createSvelteTable, flexRender, type TableOptions } from '@tanstack/svelte-table';
  import ChevronDown from 'radicle-design-system/icons/ChevronDown.svelte';
  import ChevronUp from 'radicle-design-system/icons/ChevronUp.svelte';
  import { createEventDispatcher } from 'svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let options: TableOptions<any>;
  $: table = createSvelteTable(options);

  export let isRowClickable = false;

  type Events = {
    rowClick: RowClickEventPayload;
  };

  const dispatch = createEventDispatcher<Events>();

  function onRowClick(index: number) {
    if (isRowClickable) {
      dispatch('rowClick', { rowIndex: index });
    }
  }
</script>

<table>
  <thead>
    {#each $table.getHeaderGroups() as headerGroup}
      <tr>
        {#each headerGroup.headers as header}
          <th
            on:click={header.column.getToggleSortingHandler()}
            class:sortable={header.column.getCanSort()}
            style={`width: ${header.column.getSize()}%`}
          >
            {#if !header.isPlaceholder}
              <div>
                <span class="typo-all-caps">
                  {(typeof header.column.columnDef.header === 'string' &&
                    header.column.columnDef.header) ||
                    ''}
                </span>
                {#if header.column.getIsSorted() === 'asc'}
                  <ChevronDown />
                {:else if header.column.getIsSorted() === 'desc'}
                  <ChevronUp />
                {/if}
              </div>
            {/if}
          </th>
        {/each}
      </tr>
    {/each}
  </thead>
  <tbody>
    {#each $table.getRowModel().rows as row, index}
      <tr on:click={() => onRowClick(index)} class:cursor-pointer={isRowClickable}>
        {#each row.getVisibleCells() as cell}
          <td
            class:typo-text-bold={cell.column.getIsSorted()}
            class:sorted={cell.column.getIsSorted()}
          >
            <div>
              <svelte:component
                this={flexRender(cell.column.columnDef.cell, cell.getContext())}
                context={cell.getContext()}
              />
            </div>
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
  <tfoot>
    {#each $table.getFooterGroups() as footerGroup}
      <tr>
        {#each footerGroup.headers as header}
          <th>
            {#if !header.isPlaceholder}
              <svelte:component
                this={flexRender(header.column.columnDef.footer, header.getContext())}
              />
            {/if}
          </th>
        {/each}
      </tr>
    {/each}
  </tfoot>
</table>

<style>
  table {
    padding: none;
    border-collapse: separate;
    border-spacing: 0;
    box-sizing: border-box;
    min-width: 100%;
    --border: 2px solid var(--color-foreground-level-1);
  }

  tfoot {
    color: gray;
  }

  tbody {
    width: 100%;
  }

  tbody > tr:first-child > td:first-child {
    border-radius: 0.5rem 0;
  }

  tbody > tr:first-child > td:last-child {
    border-radius: 0 0.5rem;
  }

  tbody > tr:last-child > td:first-child {
    border-radius: 0 0 0 0.5rem;
  }

  tbody > tr:last-child > td:last-child {
    border-radius: 0 0 0.5rem 0;
  }

  tbody > tr > td {
    border-top: var(--border);
  }

  tbody > tr > td:first-child {
    border-left: var(--border);
  }

  tbody > tr > td:last-child {
    border-right: var(--border);
  }

  tbody > tr:last-child > td {
    border-bottom: var(--border);
  }

  tbody > tr:only-child > td:first-child {
    border-radius: 0.5rem 0 0 0.5rem;
  }

  tbody > tr:only-child > td:last-child {
    border-radius: 0 0.5rem 0.5rem 0;
  }

  td {
    padding: 0.75rem;
    vertical-align: middle;
    color: var(--color-foreground-level-6);
  }

  td.sorted {
    color: var(--color-foreground);
  }

  td > div {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  thead th {
    text-align: left;
    padding: 0.75rem;
    user-select: none;
    color: var(--color-foreground-level-5);
  }

  thead th:first-child {
    padding-left: calc(0.75rem + 2px);
  }

  thead th div {
    display: flex;
    align-items: center;
  }

  thead th.sortable {
    cursor: pointer;
  }

  tfoot th {
    font-weight: normal;
  }

  tr {
    transition: background-color 300ms;
  }

  tr.cursor-pointer:hover {
    background-color: var(--color-foreground-level-1);
  }
</style>
