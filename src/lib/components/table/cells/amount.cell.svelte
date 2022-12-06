<script lang="ts" context="module">
  export type AmountCellData = Amount['$$prop_def'];
</script>

<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import Amount from '$lib/components/amount/amount.svelte';
  import z from 'zod';

  export let context: CellContext<unknown, unknown>;

  let props: AmountCellData;
  $: {
    const value = context.getValue();

    const amountSchema = z.object({
      amount: z.bigint(),
      multiplier: z.bigint().optional(),
      tokenAddress: z.string(),
    });

    const valueSchema = z.object({
      amount: amountSchema.optional(),
      amountPerSecond: amountSchema.optional(),
      showSymbol: z.boolean().optional(),
      overrideToDisplay: z
        .object({
          decimals: z.number(),
          symbol: z.string(),
        })
        .optional(),
    });

    props = valueSchema.parse(value);
  }
</script>

{#if props}
  <Amount {...props} />
{/if}
