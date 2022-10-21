<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import { utils } from 'ethers';
  import Token from '$lib/components/token/token.svelte';

  export let context: CellContext<unknown, unknown>;

  let address: string;
  $: {
    const value = context.getValue();

    if (!(typeof value === 'string' && utils.isAddress(value))) {
      throw new Error('Token Cell received a non-address value');
    }

    address = value;
  }
</script>

{#if address}
  <Token {address} />
{/if}
