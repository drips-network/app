<script lang="ts">
  import { page } from '$app/stores';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import ens from '$lib/stores/ens';
  import streams from '$lib/stores/streams';
  import wallet from '$lib/stores/wallet/wallet.store';
  import { onMount } from 'svelte';
  import Balances from '../dashboard/sections/balances.section.svelte';
  import Splits from '../dashboard/sections/splits.section.svelte';
  import Streams from '../dashboard/sections/streams.section.svelte';
  import SocialLink from '$lib/components/social-link/social-link.svelte';
  import unreachable from '$lib/utils/unreachable';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import { fade, fly } from 'svelte/transition';
  import decodeUserId from '$lib/utils/decode-user-id';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import CrossSmall from 'radicle-design-system/icons/CrossSmall.svelte';
  import DripsV1Logo from '$lib/components/illustrations/drips-v1-logo.svelte';
  import Button from '$lib/components/button/button.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';

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
    try {
      const decodedUserId = await decodeUserId(userId);

      address = decodedUserId.address;
      dripsUserId = decodedUserId.dripsUserId;
    } catch (e) {
      error = e instanceof Error ? e : new Error();
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

  function getDripsV1Url(address: string, ensName?: string) {
    return `https://app.v1.drips.network/${ensName ?? address}`;
  }
</script>

<svelte:head>
  <title>{(address && $ens[address]?.name) ?? address ?? userId} | Drips</title>
  <meta name="description" content="Drips User Profile" />
</svelte:head>

{#if error}
  <LargeEmptyState
    emoji="🕸️"
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
            <div class="w-full">
              <IdentityBadge disableLink {address} size="gigantic" showAvatar={false} />
            </div>
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
    <TransitionedHeight>
      {#if address && !$dismissablesStore.includes('profile-drips-v1')}
        <div out:fly|local={{ duration: 300, y: 16 }} class="drips-v1-card">
          <button
            class="close-button"
            on:click={() => dismissablesStore.dismiss('profile-drips-v1')}
          >
            <CrossSmall />
          </button>
          <div class="top">
            <div class="logo">
              <DripsV1Logo />
            </div>
          </div>
          <div class="bottom">
            <h3 class="pixelated">Looking for Drips V1?</h3>
            <p class="typo-text-small">
              The new Drips is now in public beta. You can still access Drips V1 at
              app.v1.drips.network.
            </p>
            <div class="action">
              <a href={getDripsV1Url(address, $ens[address]?.name)} target="_blank" rel="noreferrer"
                ><Button variant="normal">View profile on Drips V1</Button></a
              >
            </div>
          </div>
        </div>
      {/if}
    </TransitionedHeight>
  </div>
{/if}

<style>
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }

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

  .drips-v1-card {
    border: 1px solid var(--color-foreground);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    width: 100%;
    max-width: 24rem;
    position: relative;
    overflow: hidden;
  }

  .drips-v1-card > .close-button {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
  }

  .drips-v1-card > .top {
    background-color: var(--color-primary-level-1);
    padding: 0.75rem 0.75rem 0 0.75rem;
    max-height: 3rem;
  }

  .drips-v1-card > .top > .logo {
    background-color: var(--color-background);
    padding: 0.75rem;
    border-radius: 100rem;
    width: 4rem;
    height: 4rem;
    transform: translateY(1rem);
    border: 1px solid var(--color-primary-level-1);
  }

  .drips-v1-card > .bottom {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 3rem 0.75rem 0.75rem 0.75rem;
  }

  .drips-v1-card > .bottom > .action {
    display: flex;
    margin-top: 0.25rem;
  }

  .profile {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .social-links {
    display: flex;
    gap: 0.5rem;
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
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (max-width: 1056px) {
    .top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
