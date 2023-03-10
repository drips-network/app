<script context="module" lang="ts">
  export interface RowClickEventPayload {
    rowIndex: number;
    event: MouseEvent;
  }
</script>

<script lang="ts">
  import { createSvelteTable, flexRender, type TableOptions } from '@tanstack/svelte-table';
  import ChevronDown from 'radicle-design-system/icons/ChevronDown.svelte';
  import ChevronUp from 'radicle-design-system/icons/ChevronUp.svelte';
  import InfoCircle from 'radicle-design-system/icons/InfoCircle.svelte';
  import { createEventDispatcher } from 'svelte';
  import Tooltip from '../tooltip/tooltip.svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let options: TableOptions<any>;
  export let rowHeight: number | undefined = undefined;
  $: table = createSvelteTable(options);

  export let isRowClickable = false;

  type Events = {
    rowClick: RowClickEventPayload;
  };

  const dispatch = createEventDispatcher<Events>();

  function onRowClick(index: number, e: MouseEvent) {
    if (isRowClickable) {
      dispatch('rowClick', { rowIndex: index, event: e });
    }
  }

  let rowElems: HTMLTableRowElement[] = [];

  function handleKeyboard(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.code === 'Space') {
      const focussedElem = document.activeElement;

      if (
        !focussedElem ||
        !(focussedElem instanceof HTMLTableRowElement) ||
        !rowElems.includes(focussedElem)
      ) {
        return;
      }

      e.preventDefault();
      focussedElem.dispatchEvent(
        new PointerEvent('click', {
          metaKey: e.metaKey,
        }),
      );
    }
  }
</script>

<svelte:window on:keydown={handleKeyboard} />

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
                <div class="header">
                  {#if typeof header.column.columnDef.header === 'string'}
                    <span class="typo-all-caps">{header.column.columnDef.header}</span>
                  {/if}
                  {#if typeof header.column.columnDef.meta === 'object'}
                    {#if 'tooltipMessage' in header.column.columnDef.meta && typeof header.column.columnDef.meta['tooltipMessage'] === 'string'}
                      <Tooltip text={header.column.columnDef.meta['tooltipMessage']}>
                        <InfoCircle style="height: 1rem;" />
                      </Tooltip>
                    {/if}
                  {/if}
                </div>
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
      <tr
        style:height="{rowHeight}px"
        on:click={(e) => onRowClick(index, e)}
        on:auxclick={(e) => onRowClick(index, e)}
        class:cursor-pointer={isRowClickable}
        tabindex={isRowClickable ? 0 : -1}
        bind:this={rowElems[index]}
      >
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
    --border: 1px solid var(--color-foreground);
  }

  .header {
    display: flex;
  }

  tbody {
    width: 100%;
  }

  tbody > tr:first-child > td:first-child {
    border-radius: 1rem 0 0 0;
  }

  tbody > tr:last-child > td:first-child {
    border-radius: 0 0 0 1rem;
  }

  tbody > tr:last-child > td:last-child {
    border-radius: 0 0 1rem 0;
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
    border-radius: 1rem 0 0 1rem;
  }

  tbody > tr:only-child > td:last-child {
    border-radius: 0 0 1rem 0;
  }

  td {
    padding: 0.75rem;
    vertical-align: middle;
    color: var(--color-foreground);
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
    color: var(--color-foreground);
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

  tbody tr:not(:hover) {
    background-color: var(--color-background);
  }

  tr.cursor-pointer:hover {
    background-color: var(--color-primary-level-1);
  }

  tr.cursor-pointer:focus {
    background-color: var(--color-primary-level-1);
    outline: none;
  }
</style>
