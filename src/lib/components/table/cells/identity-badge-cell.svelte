<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import { z } from 'zod';

  export let context: CellContext<unknown, unknown>;

  let address: string;

  $: {
    const value = context.getValue();
    const addressSchema = z.string();
    address = addressSchema.parse(value);
  }
</script>

<IdentityBadge {address} />
