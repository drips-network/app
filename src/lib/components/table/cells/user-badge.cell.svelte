<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import { z } from 'zod';
  import type { AddressDriverAccount, NFTDriverAccount } from '$lib/stores/streams/types';
  import DripListBadge, {
    DRIP_LIST_BADGE_FRAGMENT,
  } from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import type { AccountId } from '$lib/utils/common-types';
  import { gql } from 'graphql-request';
  import query from '$lib/graphql/dripsQL';
  import type { DripListQuery, DripListQueryVariables } from './__generated__/gql.generated';

  export let context: CellContext<unknown, unknown>;

  let user: AddressDriverAccount | NFTDriverAccount;
  let dripList: DripListQuery['dripList'] | null | undefined;

  let dripListNameRequested = false;

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

    if (user.driver === 'nft' && dripList === undefined && !dripListNameRequested) {
      getDripList(user.accountId);
    }
  }

  async function getDripList(listId: AccountId) {
    dripListNameRequested = true;

    const dripListQuery = gql`
      ${DRIP_LIST_BADGE_FRAGMENT}
      query DripList($id: ID!) {
        dripList(id: $id) {
          ...DripListBadge
        }
      }
    `;

    const result = await query<DripListQuery, DripListQueryVariables>(dripListQuery, {
      id: listId,
    });

    dripList = result.dripList;
  }
</script>

{#if user.driver === 'address'}
  <IdentityBadge address={user.address} />
{:else}
  <!-- TODO: Donʼt presume any NFT account is a Drip List. -->
  <DripListBadge
    dripList={dripList ?? undefined}
    avatarSize="tiny"
    isLinked={false}
    showOwner={false}
  />
{/if}
