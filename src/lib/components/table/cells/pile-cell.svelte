<script lang="ts">
  import Pile from '$lib/components/pile/pile.svelte';
  import type { CellContext } from '@tanstack/svelte-table';

  export let context: CellContext<unknown, unknown>;

  let props: any;

  $: {
    props = context.getValue();
  }
</script>

<Pile {...props} />
