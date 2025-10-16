<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SupportCard from '$lib/components/support-card/support-card.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import SupportersSection from '$lib/components/supporters-section/supporters.section.svelte';
  import type { OrcidProfileFragment } from './__generated__/gql.generated';
  import getSupportersPile from '$lib/components/drip-list-card/methods/get-supporters-pile';
  import Pile from '$lib/components/pile/pile.svelte';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import type Orcid from '$lib/utils/orcids/entities';
  import OrcidProfileHeader from './orcid-profile-header.svelte';
  import buildOrcidUrl from '$lib/utils/orcids/build-orcid-url';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import network from '$lib/stores/wallet/network';
  import Button from '$lib/components/button/button.svelte';
  import Registered from '$lib/components/icons/Registered.svelte';
  import CopyLinkButton from '$lib/components/copy-link-button/copy-link-button.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import UnclaimedOrcidCard from './unclaimed-orcid-card.svelte';
  import { goto } from '$app/navigation';
  import buildUrl from '$lib/utils/build-url';
  import mergeWithdrawableBalances from '$lib/utils/merge-withdrawable-balances';
  import launchClaimOrcid from '$lib/utils/launch-claim-orcid';
  import getOrcidDisplayName from '$lib/utils/orcids/display-name';

  // for bio
  export let orcid: Orcid;
  // for everything else
  export let orcidAccount: OrcidProfileFragment;

  let supportersSectionSkeleton: SectionSkeleton | undefined;
  const orcidDisplayName = getOrcidDisplayName(orcidAccount);

  $: imageBaseUrl = `/api/share-images/orcids/${encodeURIComponent(orcid.id)}.png`;
  $: withdrawableBalances = orcidAccount.withdrawableBalances ?? [];
  $: support = orcidAccount.support ?? [];

  function claimOrcid() {
    launchClaimOrcid(orcidAccount.orcid);
  }
</script>

<HeadMeta
  title={orcidDisplayName}
  description="Support {orcidDisplayName} on Drips and help make Open-Source Software sustainable."
  image="{imageBaseUrl}?target=og"
  twitterImage="{imageBaseUrl}?target=twitter"
/>

<svelte:head>
  <link rel="canonical" href={`https://drips.network/app/orcids/${orcidAccount.orcid}`} />
</svelte:head>

<PrimaryColorThemer colorHex={undefined}>
  {#if !orcidAccount.isClaimed}
    <div class="notice">
      <AnnotationBox type="info">
        {#if withdrawableBalances.length > 0}This ORCID iD has <span class="typo-text-small-bold"
            ><AggregateFiatEstimate
              amounts={mergeWithdrawableBalances(withdrawableBalances)}
            /></span
          > in claimable funds. The owner can collect by claiming their ORCID iD.{:else}This ORCID
          iD is unclaimed on {network.label}, but can still receive funds that the owner can collect
          later.{/if}
        <svelte:fragment slot="actions">
          <div class="flex gap-3">
            <CopyLinkButton
              url={buildOrcidUrl(orcidAccount.orcid, { absolute: true })}
              variant="ghost"
            />
            <Button size="small" icon={Registered} variant="primary" on:click={claimOrcid}
              >Claim ORCID iD</Button
            >
          </div>
        </svelte:fragment>
      </AnnotationBox>
    </div>
  {/if}

  <article class="orcid-profile">
    <header class="header card">
      <div>
        <OrcidProfileHeader
          {orcid}
          {orcidAccount}
          shareButton={{
            url: buildOrcidUrl(orcidAccount.orcid, { absolute: true }),
            downloadableImageUrl: `${imageBaseUrl}?target=og`,
          }}
        />
      </div>

      <div class="stats">
        {#if orcidAccount.isClaimed}
          <div class="stat drip-bordered">
            <KeyValuePair key="Donations">
              <AggregateFiatEstimate amounts={orcidAccount.totalEarned} />
            </KeyValuePair>
          </div>
        {:else if withdrawableBalances.length > 0}
          <div class="stat drip-bordered">
            <KeyValuePair key="Unclaimed Support">
              <AggregateFiatEstimate amounts={mergeWithdrawableBalances(withdrawableBalances)} />
            </KeyValuePair>
          </div>
        {/if}
        {#if [support].flat().length > 0}
          <div class="stat drip-bordered">
            <!-- ("Supporters" stat) -->
            <a href="#support" on:click={() => supportersSectionSkeleton?.highlightSection()}>
              <KeyValuePair key="Supporters">
                <Pile maxItems={4} components={getSupportersPile(support)} />
              </KeyValuePair>
            </a>
          </div>
        {/if}
      </div>
    </header>

    <div class="orcid-profile-content">
      <Developer accountId={orcidAccount?.account.accountId} />

      {#if !orcidAccount.isClaimed && withdrawableBalances.length > 0}
        <section class="app-section">
          <SectionHeader icon={Wallet} label="Claimable funds" />
          <SectionSkeleton loaded={true}>
            <div class="unclaimed-funds-section">
              <UnclaimedOrcidCard
                {orcidAccount}
                unclaimedTokensExpandable={false}
                unclaimedTokensExpanded={withdrawableBalances.length > 0}
                showClaimButton={!orcidAccount.isClaimed}
                on:claimButtonClick={() =>
                  goto(buildUrl('/app/claim-orcid', { orcidToClaim: orcidAccount.orcid }))}
              />
            </div>
          </SectionSkeleton>
        </section>
      {/if}

      <section id="support">
        <SupportersSection
          bind:sectionSkeleton={supportersSectionSkeleton}
          type="ecosystem"
          supportItems={support}
        />
      </section>
    </div>

    <aside>
      <div class="become-supporter-card">
        <SupportCard orcid={orcidAccount} />
      </div>
    </aside>
  </article>
</PrimaryColorThemer>

<style>
  .orcid-profile > * {
    min-width: 0;
  }

  .orcid-profile {
    display: grid;
    grid-template-columns: 3fr minmax(auto, 18rem);
    gap: 3rem;
  }

  .orcid-profile-content {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .orcid-profile > * {
    max-width: 100%;
  }

  aside {
    grid-row-start: 1;
    grid-column-start: 2;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    justify-content: space-between;
  }

  .stats {
    overflow: scroll;
    gap: 1.5rem;
    display: flex;
  }

  .stats .stat {
    padding: 1rem;
    min-height: 6.125rem;
    flex-basis: 50%;
  }

  .card {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .drip-bordered {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
  }

  .become-supporter-card {
    height: 100%;
  }

  .notice {
    margin-bottom: 2rem;
  }

  #support {
    gap: 3rem;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 1080px) {
    .header {
      margin-bottom: 0;
    }

    aside {
      height: auto;
    }

    .orcid-profile {
      gap: 1.5rem;
    }

    .header {
      grid-row-start: 1;
      grid-column: span 2;
    }

    aside {
      grid-row-start: 3;
      grid-column: span 2;
    }

    .orcid-profile-content {
      gap: 1.5rem;
      grid-row-start: 2;
      grid-column: span 2;
    }
  }

  @media (max-width: 768px) {
    .stats {
      gap: 1rem;
      grid-template-columns: auto auto;
    }

    .stats .stat:first-child {
      grid-column: span 2;
      grid-row-start: 2;
    }

    .header {
      gap: 1.5rem;
    }
  }
</style>
