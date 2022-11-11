<script lang="ts">
  import { page } from '$app/stores';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import streams from '$lib/stores/streams';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import { isAddress } from 'ethers/lib/utils';
  import { AddressDriverClient } from 'radicle-drips';
  import { onMount } from 'svelte';
  import Balances from '../dashboard/sections/balances.section.svelte';
  import Splits from '../dashboard/sections/splits.section.svelte';
  import Streams from '../dashboard/sections/streams.section.svelte';

  $: userId = $page.params.userId;

  let dripsUserId: string | undefined;
  let address: string | undefined;

  onMount(async () => {
    if (isAddress(userId)) {
      address = userId;
      dripsUserId = await (await getAddressDriverClient()).getUserIdByAddress(userId);
    } else if (/^\d+$/.test(userId)) {
      // User ID param has only numbers and is probably a drips user ID
      dripsUserId = userId;
      address = AddressDriverClient.getUserAddress(userId);
    } else {
      throw new Error('Provided value aint an address or user ID');
    }
  });

  onMount(async () => {
    await streams.connect(userId);
  });
</script>

<div class="profile">
  {#if address}
    <div class="identity">
      <IdentityBadge {address} size="gigantic" showIdentity={false} />
      <IdentityBadge {address} size="gigantic" showAvatar={false} />
    </div>
  {/if}
  <Balances {userId} />
  <Streams {userId} />
  <Splits {userId} />
</div>

<style>
  .identity {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .profile {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
</style>
