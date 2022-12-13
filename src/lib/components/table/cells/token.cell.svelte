<script lang="ts" context="module">
  export type TokenCellData = Token['$$prop_def'];
</script>

<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import Token from '$lib/components/token/token.svelte';
  import { z } from 'zod';

  export let context: CellContext<unknown, unknown>;

  let props: Token['$$prop_def'];

  $: {
    const value = context.getValue();

    const propSchema = z.object({
      address: z.string(),
      show: z.union([z.literal('none'), z.literal('name'), z.literal('symbol')]).optional(),
      size: z.union([z.literal('small'), z.literal('normal'), z.literal('huge')]).optional(),
      overrideToDisplay: z
        .object({
          name: z.string(),
          logoURI: z.string().optional(),
          symbol: z.string(),
        })
        .optional(),
    });

    props = propSchema.parse(value);
  }
</script>

<Token {...props} />
