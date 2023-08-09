<script lang="ts">
  import { page } from '$app/stores';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import ens from '$lib/stores/ens';
  import streams from '$lib/stores/streams';
  import wallet from '$lib/stores/wallet/wallet.store';
  import { onMount } from 'svelte';
  import Balances from '../streams/sections/balances.section.svelte';
  import Streams from '../streams/sections/streams.section.svelte';
  import SocialLink from '$lib/components/social-link/social-link.svelte';
  import unreachable from '$lib/utils/unreachable';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import { fade, fly } from 'svelte/transition';
  import decodeAccountId from '$lib/utils/decode-user-id';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import DripsV1Logo from '$lib/components/illustrations/drips-v1-logo.svelte';
  import Banner from '$lib/components/banner/banner.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ProjectsSection from '$lib/components/projects-section/projects-section.svelte';
  import DripListsSection from '$lib/components/drip-lists-section/drip-lists-section.svelte';

  $: accountId = $page.params.accountId;

  let dripsAccountId: string | undefined;
  let address: string | undefined;
  let error: Error | undefined;

  const ensRecords = ['description', 'url', 'com.twitter', 'com.github'] as const;
  const socialLinks = ['com.twitter', 'com.github', 'url'] as const;

  let socialLinkValues: { [key in (typeof socialLinks)[number]]: string } | undefined = undefined;
  let description: string | undefined;

  async function fetchEnsRecords(
    ensName: string,
  ): Promise<{ [key in (typeof ensRecords)[number]]: string } | undefined> {
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
      const decodedAccountId = await decodeAccountId(accountId);

      address = decodedAccountId.address;
      dripsAccountId = decodedAccountId.dripsAccountId;
    } catch (e) {
      error = e instanceof Error ? e : new Error();
    }
  });

  $: {
    const name = address && $ens[address]?.name;
    if (name) updateEnsRecords(name);
  }

  function isNetwork(input: string): input is (typeof socialLinks)[number] {
    return socialLinks.includes(input as (typeof socialLinks)[number]);
  }

  async function fetchRequestedAccount(accountId: string) {
    try {
      await streams.fetchAccount(accountId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      error = e instanceof Error ? e : new Error('Unable to fetch account');
    }
  }

  $: dripsAccountId && fetchRequestedAccount(dripsAccountId);

  function getDripsV1Url(address: string, ensName?: string) {
    return `https://app.v1.drips.network/${ensName ?? address}`;
  }
</script>

<HeadMeta title={(address && $ens[address]?.name) ?? address ?? accountId} />

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
            <IdentityBadge
              disableLink
              {address}
              size="gigantic"
              showIdentity={false}
              disableTooltip
            />
            <div class="w-full">
              <IdentityBadge
                disableLink
                {address}
                size="gigantic"
                showAvatar={false}
                disableTooltip
              />
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
    <ProjectsSection collapsable {address} />
    <DripListsSection collapsable {address} />
    <Streams collapsable accountId={dripsAccountId} />
    <Balances collapsable collapsed accountId={dripsAccountId} />
    {#if address && !$dismissablesStore.includes('profile-drips-v1')}
      <div class="drips-v1-banner" out:fly|local={{ duration: 300, y: 16 }}>
        <Banner
          title="Looking for the old Drips?"
          description="You can still access the previous Drips app at app.v1.drips.network."
          button={{
            label: 'View profile on Drips V1',
            href: getDripsV1Url(address, $ens[address]?.name),
          }}
          icon={DripsV1Logo}
          on:dismiss={() => dismissablesStore.dismiss('profile-drips-v1')}
        />
      </div>
    {/if}
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
</style>
