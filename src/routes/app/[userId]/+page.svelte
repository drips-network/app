<script lang="ts">
  import { page } from '$app/stores';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import ens from '$lib/stores/ens';
  import streams from '$lib/stores/streams';
  import wallet from '$lib/stores/wallet';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import { isAddress } from 'ethers/lib/utils';
  import { AddressDriverClient } from 'radicle-drips';
  import { onMount } from 'svelte';
  import Balances from '../dashboard/sections/balances.section.svelte';
  import Splits from '../dashboard/sections/splits.section.svelte';
  import Streams from '../dashboard/sections/streams.section.svelte';
  import SocialLink from '$lib/components/social-link/social-link.svelte';
  import unreachable from '$lib/utils/unreachable';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import { fade } from 'svelte/transition';

  $: userId = $page.params.userId;

  let dripsUserId: string | undefined;
  let address: string | undefined;
  let error: Error | undefined;

  const ensRecords = ['description', 'url', 'com.twitter', 'com.github'] as const;
  const socialLinks = ['com.twitter', 'com.github', 'url'] as const;

  let socialLinkValues: { [key in typeof socialLinks[number]]: string } | undefined = undefined;
  let description: string | undefined;

  async function fetchEnsRecords(
    ensName: string,
  ): Promise<{ [key in typeof ensRecords[number]]: string } | undefined> {
    try {
      const { provider } = $wallet;

      const resolver = await provider.getResolver(ensName);

      const promises = ensRecords.map(async (recordName) => [
        recordName,
        await resolver?.getText(recordName),
      ]);

      const result = Object.fromEntries(await Promise.all(promises));

      return result;
    } catch {
      return undefined;
    }
  }

  async function updateEnsRecords(name: string) {
    const records = await fetchEnsRecords(name);

    if (!records) return;

    description = records.description;

    socialLinkValues = {
      url: records.url,
      'com.github': records['com.github'],
      'com.twitter': records['com.twitter'],
    };
  }

  onMount(async () => {
    if (isAddress(userId)) {
      address = userId;
      dripsUserId = await (await getAddressDriverClient()).getUserIdByAddress(userId);
    } else if (/^\d+$/.test(userId)) {
      // User ID param has only numbers and is probably a drips user ID
      dripsUserId = userId;
      address = AddressDriverClient.getUserAddress(userId);
    } else if (userId.endsWith('.eth')) {
      const lookup = await ens.reverseLookup(userId);
      if (lookup) {
        dripsUserId = await (await getAddressDriverClient()).getUserIdByAddress(lookup);
        address = lookup;
      } else {
        error = new Error('Not found');
      }
    } else {
      error = new Error('Not found.');
    }
  });

  $: {
    const name = address && $ens[address]?.name;
    if (name) updateEnsRecords(name);
  }

  function isNetwork(input: string): input is typeof socialLinks[number] {
    return socialLinks.includes(input as typeof socialLinks[number]);
  }

  async function fetchRequestedAccount(userId: string) {
    try {
      await streams.fetchAccount(userId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      error = e instanceof Error ? e : new Error('Unable to fetch account');
    }
  }

  $: dripsUserId && fetchRequestedAccount(dripsUserId);
</script>

<svelte:head>
  <title>Profile - {(address && $ens[address]?.name) ?? address ?? userId}</title>
  <meta name="description" value="Radicle Drips Dashboard" />
</svelte:head>

{#if error}
  <LargeEmptyState
    emoji="🕸"
    headline="Unable to show profile"
    description="We weren't able to find that profile."
  />
{:else}
  <div class="profile">
    <SectionSkeleton placeholderOutline={false} loaded={Boolean(address)}>
      {#if address}
        <div class="identity">
          <div class="avatar-and-name">
            <IdentityBadge disableLink {address} size="gigantic" showIdentity={false} />
            <IdentityBadge disableLink {address} size="gigantic" showAvatar={false} />
          </div>
          <div class="social-links">
            <div in:fade><SocialLink network="ethereum" value={address} /></div>
            {#each Object.entries(socialLinkValues ?? {}) as [network, value]}
              {#if value}<div in:fade>
                  <SocialLink network={isNetwork(network) ? network : unreachable()} {value} />
                </div>{/if}
            {/each}
          </div>
          {#if description}<p class="description" in:fade>{description}</p>{/if}
        </div>
      {/if}
    </SectionSkeleton>
    <Balances userId={dripsUserId} />
    <Streams userId={dripsUserId} />
    <Splits userId={dripsUserId} />
  </div>
{/if}

<style>
  .identity {
    display: flex;
    gap: 1.5rem;
    flex-direction: column;
  }

  .identity > .avatar-and-name {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .profile {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .social-links {
    display: flex;
    gap: 0.5rem;
    color: var(--color-foreground-level-4);
    flex-wrap: wrap;
  }

  .social-links * {
    display: flex;
    gap: 0.5rem;
  }
  .social-links *:not(:last-child)::after {
    content: '•';
  }

  .description {
    max-width: 40rem;
    color: var(--color-foreground-level-6);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
