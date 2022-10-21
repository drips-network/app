<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import { utils } from 'ethers';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';

  export let context: CellContext<unknown, unknown>;

  let address: string;
  $: {
    const value = context.getValue();

    if (!(typeof value === 'string' && utils.isAddress(value))) {
      throw new Error('Identity Badge Cell received a non-address value');
    }

    address = value;
  }
</script>

{#if address}
  <IdentityBadge {address} />
{/if}
