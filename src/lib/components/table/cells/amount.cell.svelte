<script lang="ts" context="module">
  export interface AmountCellData {
    amount: bigint;
    tokenAddress: string;
    delta?: 'positive' | 'negative';
  }
</script>

<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import Amount from '$lib/components/amount/amount.svelte';
  import z from 'zod';

  export let context: CellContext<unknown, unknown>;

  let amount: bigint;
  let tokenAddress: string;
  let delta: 'positive' | 'negative' | undefined;
  $: {
    const value = context.getValue();

    const valueSchema = z.object({
      amount: z.bigint(),
      tokenAddress: z.string(),
      delta: z.union([z.literal('positive'), z.literal('negative'), z.undefined()]),
    });

    const parsed = valueSchema.parse(value);

    amount = parsed.amount;
    tokenAddress = parsed.tokenAddress;
    delta = parsed.delta;
  }
</script>

{#if amount && tokenAddress}
  <Amount {amount} {tokenAddress} {delta} />
{/if}
