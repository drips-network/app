<script lang="ts">
  import { page } from '$app/stores';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import ens from '$lib/stores/ens';
  import streams from '$lib/stores/streams';
  import wallet from '$lib/stores/wallet/wallet.store';
  import { onMount } from 'svelte';
  import Balances from '../funds/sections/balances.section.svelte';
  import Streams from '../funds/sections/streams.section.svelte';
  import SocialLink from '$lib/components/social-link/social-link.svelte';
  import unreachable from '$lib/utils/unreachable';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import { fade } from 'svelte/transition';
  import decodeUniversalAccountId from '$lib/utils/decode-universal-account-id';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ProjectsSection from '$lib/components/projects-section/projects-section.svelte';
  import DripListsSection from '$lib/components/drip-lists-section/drip-lists-section.svelte';
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import { goto } from '$app/navigation';
  import walletStore from '$lib/stores/wallet/wallet.store';

  $: accountId = $page.params.accountId;

  let dripsAccountId: string | undefined;
  let address: string | undefined;
  let error: 'is-repo-driver-account-id' | 'ens-not-resolved' | true | undefined;

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
      const decodedAccountId = await decodeUniversalAccountId(accountId);

      switch (decodedAccountId.driver) {
        case 'address': {
          address = decodedAccountId.address;
          dripsAccountId = decodedAccountId.dripsAccountId;
          break;
        }
        case 'nft': {
          goto(`/app/drip-lists/${decodedAccountId.dripsAccountId}`);
          break;
        }
        case 'repo': {
          error = 'is-repo-driver-account-id';
          break;
        }
      }
    } catch (e) {
      if (typeof e === 'object' && e && 'message' in e && e.message === 'Not found') {
        error = 'ens-not-resolved';
      } else {
        // eslint-disable-next-line no-console
        console.error(e);

        error = true;
      }
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
      error = true;
    }
  }

  $: dripsAccountId && fetchRequestedAccount(dripsAccountId);
  $: isSelf = address && address.toLowerCase() === $walletStore.address?.toLowerCase();
</script>

<HeadMeta title={(address && $ens[address]?.name) ?? address ?? accountId} />

{#if error === 'is-repo-driver-account-id'}
  <LargeEmptyState
    emoji="🕸️"
    headline="Unable to jump to projects by account ID"
    description="Sorry, but jumping to a Drips Project by its account ID is currently not supported."
  />
{:else if error === 'ens-not-resolved'}
  <LargeEmptyState
    emoji="🕸️"
    headline="Not found"
    description="Sorry, but we couldn't find that ENS name."
  />
{:else if error}
  <LargeEmptyState
    emoji="🕸️"
    headline="Something went wrong"
    description="There may be more information in the developer console."
  />
{:else}
  <article class="flex flex-col gap-16">
    <SectionSkeleton placeholderOutline={false} loaded={Boolean(address)}>
      {#if address}
        <header class="flex flex-wrap sm:flex-nowrap gap-4">
          <IdentityBadge
            disableLink
            {address}
            size="gigantic"
            showIdentity={false}
            disableTooltip
          />
          <div class="flex items-center sm:py-4">
            <div class="flex flex-col gap-4">
              <h1 class="w-full -mb-2">
                <IdentityBadge
                  disableLink
                  {address}
                  size="gigantic"
                  showAvatar={false}
                  disableTooltip
                />
              </h1>
              <ul class="social-links">
                <div in:fade|local><SocialLink network="ethereum" value={address} /></div>
                {#each Object.entries(socialLinkValues ?? {}) as [network, value]}
                  {#if value}<li in:fade|local>
                      <SocialLink network={isNetwork(network) ? network : unreachable()} {value} />
                    </li>{/if}
                {/each}
              </ul>
              {#if description}<p in:fade|local>{description}</p>{/if}
            </div>
          </div>
        </header>
      {/if}
    </SectionSkeleton>
    <Developer accountId={dripsAccountId} />
    <ProjectsSection collapsable {address} emptyOrderLast />
    <DripListsSection collapsable accountId={dripsAccountId} emptyOrderLast />
    <Streams collapsable accountId={dripsAccountId} disableActions={!isSelf} emptyOrderLast />
    <Balances collapsable collapsed accountId={dripsAccountId} emptyOrderLast />
  </article>
{/if}

<style>
  .social-links {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .social-links * {
    display: flex;
    gap: 0.375rem;
  }
</style>
