<script lang="ts">
  import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import type { CellContext } from '@tanstack/svelte-table';

  export let context: CellContext<unknown, unknown>;

  let dripList: any;

  $: {
    dripList = context.getValue();
  }
</script>

<div style="max-width: max(300px, 60vw)">
  <DripListBadge {dripList} />
</div>
