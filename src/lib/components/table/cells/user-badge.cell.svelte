<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import { z } from 'zod';
  import type { AddressDriverAccount, NFTDriverAccount } from '$lib/stores/streams/types';
  import Ledger from 'radicle-design-system/icons/Ledger.svelte';

  export let context: CellContext<unknown, unknown>;

  let user: AddressDriverAccount | NFTDriverAccount;
  $: {
    const value = context.getValue();

    const userSchema = z.union([
      z.object({
        driver: z.literal('address'),
        accountId: z.string(),
        address: z.string(),
      }),
      z.object({
        driver: z.literal('nft'),
        accountId: z.string(),
      }),
    ]);

    user = userSchema.parse(value);
  }
</script>

{#if user.driver === 'address'}
  <IdentityBadge address={user.address} />
{:else}
  <!-- TODO: Don't presume any NFT account is a Drip List. -->
  <div class="drip-list-badge">
    <div class="icon">
      <Ledger style="fill: var(--color-background)" />
    </div>
    <span class="typo-text">Your Drip List</span>
  </div>
{/if}

<style>
  .drip-list-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon {
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-foreground);
    border-radius: 50%;
  }
</style>
