<script lang="ts">
  export let caption: string =
    'A recipient can be a wallet address, GitHub repo URL, or Drip List URL.';
  export let headers: Array<string> = ['Recipients', 'Split(%)'];
  export let data: Array<Array<unknown>> = [
    ['0x79756b6C2f913271fc0ee29A877fbd98258972BF', 20],
    ['https://github.com/graphdeco-inria/hierarchical-3d-gaussians', 75],
    [
      'https://www.drips.network/app/drip-lists/31017209032870028068280040871339261037749177808773684797297972107972',
      5,
    ],
  ];
</script>

<table>
  {#if caption}
    <caption class="typo-text-small mt-4">
      {caption}
    </caption>
  {/if}
  <thead>
    <tr>
      {#each headers as header}
        <th class="typo-text-bold">{header}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each data as row}
      <tr>
        {#each row as column}
          <td>{column}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    border-collapse: separate;
    border-spacing: 0;
    box-sizing: border-box;
    min-width: 100%;
    --border: 1px solid var(--color-foreground);
    table-layout: fixed;
  }

  table caption {
    caption-side: bottom;
  }

  thead > tr > th {
    border-top: var(--border);
    border-right: var(--border);
    padding: 4px 8px;
  }

  thead > tr > th:first-child {
    border-left: var(--border);
  }

  tbody {
    width: 100%;
  }

  thead > tr:first-child > th:first-child {
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
    border-right: var(--border);
    text-wrap: nowrap;
    background-color: var(--color-foreground-level-1);
  }

  tbody > tr > td:first-child {
    border-left: var(--border);
    max-width: 500px;
    overflow: hidden;
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
    padding: 4px 8px;
    vertical-align: middle;
    text-align: left;
    color: var(--color-foreground);
  }

  thead th {
    text-align: left;
    padding: 8px;
    user-select: none;
    color: var(--color-foreground);
    white-space: nowrap;
  }
</style>
