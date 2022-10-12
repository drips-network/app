<script lang="ts" context="module">
  export interface AmountCellData {
    amount?: bigint;
    tokenAddress: string;
    showSymbol?: boolean;
    amountPerSecond?: bigint;
  }
</script>

<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import Amount from '$lib/components/amount/amount.svelte';
  import z from 'zod';

  export let context: CellContext<unknown, unknown>;

  let props: AmountCellData;
  $: {
    const value = context.getValue();

    const valueSchema = z.object({
      amount: z.bigint().optional(),
      tokenAddress: z.string(),
      showSymbol: z.boolean().optional(),
      amountPerSecond: z.bigint().optional(),
    });

    props = valueSchema.parse(value);
  }
</script>

{#if props}
  <Amount {...props} />
{/if}
