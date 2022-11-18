<script lang="ts" context="module">
  export interface LinkCellData {
    href: string;
    label: string;
  }
</script>

<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import { z } from 'zod';

  export let context: CellContext<unknown, unknown>;

  let href: string;
  let label: string;
  $: {
    const value = context.getValue();

    const contextSchema = z.object({
      href: z.string(),
      label: z.string(),
    });

    const parsed = contextSchema.parse(value);

    href = parsed.href;
    label = parsed.label;
  }
</script>

<a {href}>{label}</a>

<style>
  a:hover {
    text-decoration: underline;
  }
</style>
