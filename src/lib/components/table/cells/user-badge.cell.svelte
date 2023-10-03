<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import { z } from 'zod';
  import type { AddressDriverAccount, NFTDriverAccount } from '$lib/stores/streams/types';
  import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import DripListService from '$lib/utils/driplist/DripListService';
  import type { AccountId } from '$lib/utils/common-types';
  import type { DripList } from '$lib/utils/metadata/types';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';

  export let context: CellContext<unknown, unknown>;

  let user: AddressDriverAccount | NFTDriverAccount;
  let dripList: DripList | null | undefined;

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

    if (user.driver === 'nft' && dripList === undefined) {
      getDripList(user.accountId);
    }
  }

  async function getDripList(listId: AccountId) {
    const dripListService = await DripListService.new();
    dripList = await dripListService.getByTokenId(listId);
  }
</script>

{#if user.driver === 'address'}
  <IdentityBadge address={user.address} />
{:else}
  <!-- TODO: Donʼt presume any NFT account is a Drip List. -->
  {#if dripList}
    <DripListBadge
      listName={dripList.name}
      listId={user.accountId}
      owner={dripList.account.owner.address}
    />
  {:else}
    <div class="flex items-center gap-2">
      <DripListIcon /> <span class="animate-pulse">...</span>
    </div>
  {/if}
{/if}
