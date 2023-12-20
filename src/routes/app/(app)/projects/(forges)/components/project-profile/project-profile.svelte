<script lang="ts" context="module">
  export const PROJECT_PROFILE_FRAGMENT = gql`
    ${PROJECT_PROFILE_HEADER_FRAGMENT}
    ${EDIT_PROJECT_METADATA_FLOW_FRAGMENT}
    ${DRIP_LIST_BADGE_FRAGMENT}
    ${SUPPORT_CARD_PROJECT_FRAGMENT}
    ${EDIT_PROJECT_SPLITS_FLOW_ADDRESS_RECEIVER_FRAGMENT}
    ${EDIT_PROJECT_SPLITS_FLOW_DRIP_LIST_RECEIVER_FRAGMENT}
    ${EDIT_PROJECT_SPLITS_FLOW_PROJECT_RECEIVER_FRAGMENT}
    ${UNCLAIMED_PROJECT_CARD_FRAGMENT}
    ${SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT}
    ${SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT}
    fragment ProjectProfile on Project {
      ...UnclaimedProjectCard
      ...ProjectProfileHeader
      ...SupportCardProject
      ...SplitsComponentProjectSplits
      ... on UnclaimedProject {
        account {
          accountId
        }
        support {
          ...SupportersSectionSupportItem
        }
      }
      ... on ClaimedProject {
        ...EditProjectMetadataFlow
        account {
          accountId
        }
        owner {
          accountId
        }
        support {
          ...SupportersSectionSupportItem
        }
      }
    }
  `;
</script>

<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SplitsIcon from 'radicle-design-system/icons/Splits.svelte';
  import SupportCard, {
    SUPPORT_CARD_PROJECT_FRAGMENT,
  } from '$lib/components/support-card/support-card.svelte';
  import ProjectProfileHeader, {
    PROJECT_PROFILE_HEADER_FRAGMENT,
  } from '$lib/components/project-profile-header/project-profile-header.svelte';
  import UnclaimedProjectCard, {
    UNCLAIMED_PROJECT_CARD_FRAGMENT,
  } from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import SplitsComponent, {
    SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT,
  } from '$lib/components/splits/splits.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Pile from '$lib/components/pile/pile.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import SupportersSection, {
    SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT,
  } from '$lib/components/supporters-section/supporters.section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Button from '$lib/components/button/button.svelte';
  import Pen from 'radicle-design-system/icons/Pen.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import editProjectMetadataSteps, {
    EDIT_PROJECT_METADATA_FLOW_FRAGMENT,
  } from '$lib/flows/edit-project-metadata/edit-project-metadata-steps';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Registered from 'radicle-design-system/icons/Registered.svelte';
  import buildUrl from '$lib/utils/build-url';
  import editProjectSplitsSteps, {
    EDIT_PROJECT_SPLITS_FLOW_ADDRESS_RECEIVER_FRAGMENT,
    EDIT_PROJECT_SPLITS_FLOW_DRIP_LIST_RECEIVER_FRAGMENT,
    EDIT_PROJECT_SPLITS_FLOW_PROJECT_RECEIVER_FRAGMENT,
  } from '$lib/flows/edit-project-splits/edit-project-splits-steps';
  import { fade } from 'svelte/transition';
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import isClaimed from '$lib/utils/project/is-claimed';
  import { gql } from 'graphql-request';
  import type {
    ProjectProfileFragment,
    ProjectProfile_ClaimedProject_Fragment,
  } from './__generated__/gql.generated';
  import { DRIP_LIST_BADGE_FRAGMENT } from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import unreachable from '$lib/utils/unreachable';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import highlightStore from '$lib/stores/highlight/highlight.store';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import mergeAmounts from '$lib/utils/amounts/merge-amounts';

  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  export let project: ProjectProfileFragment;

  export let unclaimedFunds: Promise<{ splittable: Amount[]; collectable: Amount[] }> | undefined =
    undefined;
  export let earnedFunds: Promise<Amount[]> | undefined = undefined;

  $: ownAccountId = $walletStore.dripsAccountId;
  $: isOwnProject = ownAccountId === (isClaimed(project) ? project.owner.accountId : undefined);

  function getSplitsPile(
    splitCollections: (
      | ProjectProfile_ClaimedProject_Fragment['splits']['maintainers']
      | ProjectProfile_ClaimedProject_Fragment['splits']['dependencies']
    )[],
  ) {
    const splits = splitCollections.flat();

    return mapFilterUndefined(splits, (v) => {
      switch (v.__typename) {
        case 'AddressReceiver':
          return {
            component: IdentityBadge,
            props: {
              address: v.account.address,
              showIdentity: false,
              outline: true,
              size: 'medium',
            },
          };
        case 'ProjectReceiver':
          return {
            component: ProjectAvatar,
            props: {
              project: v.project,
              outline: true,
            },
          };
        default:
          return undefined;
      }
    });
  }

  $: mobileView =
    $breakpointsStore?.breakpoint === 'mobile' || $breakpointsStore?.breakpoint === 'tablet';

  let collectHintTriggered = false;

  function triggerCollectHint() {
    collectHintTriggered = true;

    setTimeout(() => {
      highlightStore.highlight({
        title: 'Collect your earnings',
        description: 'You can collect earnings to your wallet on the Projects screen.',
        element: document.querySelectorAll(
          mobileView
            ? "[data-highlightid='bottomnav-/app/projects']"
            : "[data-highlightid='sidenav-/app/projects']",
        )[0],
        borderRadius: mobileView ? '1rem 0 1rem 1rem' : '2rem 0 2rem 2rem',
        paddingPx: mobileView ? 8 : 0,
      });
    }, 2000);
  }

  const walletInitialized = walletStore.initialized;

  $: {
    if (browser && !collectHintTriggered && $walletInitialized) {
      let url = new URL(window.location.href);

      if (url.searchParams.get('collectHint') === 'true') {
        url.searchParams.delete('collectHint');
        window.history.replaceState({}, '', url.toString());

        if (!dismissablesStore.isDismissed('project-claim-collect-hint')) {
          triggerCollectHint();
          dismissablesStore.dismiss('project-claim-collect-hint');
        }
      }
    }
  }
</script>

{#if true}
  {@const imageBaseUrl = `/api/share-images/project/${encodeURIComponent(project.source.url)}.png`}
  <HeadMeta
    title="{project.source.ownerName}/{project.source.repoName}"
    description="Support {project.source
      .repoName} on Drips and help make Open-Source Software sustainable."
    image="{imageBaseUrl}?target=og"
    twitterImage="{imageBaseUrl}?target=twitter"
  />
{/if}

<PrimaryColorThemer colorHex={isClaimed(project) ? project.color : undefined}>
  {#if !isClaimed(project)}
    <div class="unclaimed-project-notice">
      <AnnotationBox type="info">
        {#await unclaimedFunds}
          <span />
        {:then res}
          {@const result = res && mergeAmounts(res.splittable, res.collectable)}
          {#if result?.length}This project has <span class="typo-text-small-bold"
              ><AggregateFiatEstimate amounts={result} /></span
            > in claimable funds! Project owners can collect by claiming their project.{:else}This
            project has not been claimed yet but can still receive funds that the owner can collect
            later.{/if}
        {:catch}
          This project is unclaimed.
        {/await}
        <svelte:fragment slot="actions">
          <div class="flex gap-3">
            <ShareButton url={browser ? window.location.href : ''} />
            <Button
              size="small"
              icon={Registered}
              variant="primary"
              on:click={() =>
                goto(buildUrl('/app/claim-project', { projectToAdd: project.source.url }))}
              >Claim project</Button
            >
          </div>
        </svelte:fragment>
      </AnnotationBox>
    </div>
  {/if}

  <article class="project-profile" class:claimed={isClaimed(project)}>
    <header class="header">
      {#if isClaimed(project)}
        <div class="owner">
          <span class="typo-text" style:color="var(--color-foreground-level-5)"
            >Project claimed by</span
          >
          <IdentityBadge address={project.owner.address} disableTooltip />
        </div>
      {/if}
      <div>
        <ProjectProfileHeader
          {project}
          editButton={isClaimed(project) && isOwnProject ? 'Edit' : undefined}
          on:editButtonClick={() =>
            isClaimed(project) && modal.show(Stepper, undefined, editProjectMetadataSteps(project))}
        />
      </div>
      {#if isClaimed(project)}
        {#await earnedFunds}
          <div class="stats loading">
            <Spinner />
          </div>
        {:then earnedFundsResult}
          <div class="stats" in:fade|local={{ duration: 300 }}>
            {#if earnedFundsResult}
              <div class="stat">
                <KeyValuePair key="Total income">
                  <AggregateFiatEstimate amounts={earnedFundsResult} />
                </KeyValuePair>
              </div>
            {/if}
            {#if isClaimed(project)}
              <div class="stat">
                <KeyValuePair key="Splits with">
                  {#if [project.splits.maintainers, project.splits.dependencies].flat().length > 0}
                    <Pile
                      maxItems={5}
                      components={getSplitsPile([
                        project.splits.maintainers ?? [],
                        project.splits.dependencies ?? [],
                      ])}
                    />
                  {:else}
                    None
                  {/if}
                </KeyValuePair>
              </div>
            {/if}
          </div>
        {/await}
      {/if}
    </header>
    <div class="content">
      <Developer accountId={project.account.accountId} />
      {#if isClaimed(project)}
        <section class="app-section">
          <SectionHeader
            icon={SplitsIcon}
            label="Splits"
            actions={isOwnProject
              ? [
                  {
                    handler: () =>
                      isClaimed(project) &&
                      modal.show(
                        Stepper,
                        undefined,
                        isClaimed(project)
                          ? editProjectSplitsSteps(project.account.accountId, project.splits)
                          : unreachable(),
                      ),
                    label: 'Edit',
                    icon: Pen,
                  },
                ]
              : []}
          />
          <SectionSkeleton
            loaded={true}
            empty={project.splits.maintainers.length === 0 &&
              project.splits.dependencies.length === 0}
            emptyStateHeadline="No splits"
            emptyStateEmoji="🫧"
            emptyStateText="This project isnʼt sharing incoming funds with any maintainers or dependencies."
          >
            <div class="card">
              <div class="outgoing-splits">
                <ProjectBadge {project} />
                <SplitsComponent
                  list={[
                    {
                      __typename: 'SplitGroup',
                      name: 'Maintainers',
                      list: project.splits.maintainers,
                    },
                    {
                      __typename: 'SplitGroup',
                      name: 'Dependencies',
                      list: project.splits.dependencies,
                    },
                  ]}
                />
              </div>
            </div>
          </SectionSkeleton>
        </section>
      {:else if unclaimedFunds}
        <section class="app-section">
          <SectionHeader icon={Wallet} label="Claimable funds" />
          {#await unclaimedFunds}
            <SectionSkeleton loaded={false} />
          {:then result}
            {@const merged = result && mergeAmounts(result.splittable, result.collectable)}
            <SectionSkeleton loaded={true}>
              <div class="unclaimed-funds-section">
                <UnclaimedProjectCard
                  unclaimedFunds={result}
                  unclaimedTokensExpandable={false}
                  unclaimedTokensExpanded={merged.length > 0}
                  showClaimButton
                  on:claimButtonClick={() =>
                    goto(buildUrl('/app/claim-project', { projectToAdd: project.source.url }))}
                />
              </div>
            </SectionSkeleton>
          {:catch}
            <SectionSkeleton loaded={true} error={true} />
          {/await}
        </section>
      {/if}
      <SupportersSection
        accountId={project.account.accountId}
        type="project"
        supportItems={project.support}
      />
    </div>
    <aside>
      <div class="become-supporter-card">
        <SupportCard {project} />
      </div>
    </aside>
  </article>
</PrimaryColorThemer>

<style>
  .project-profile {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      'header'
      'content';
    gap: 3rem;
  }

  .project-profile > * {
    min-width: 0;
  }

  .project-profile {
    grid-template-columns: 3fr minmax(auto, 18rem);
    grid-template-rows: auto auto auto;
    grid-template-areas:
      'header sidebar'
      'content sidebar';
  }

  aside {
    grid-area: sidebar;
  }

  .project-profile > * {
    max-width: 100%;
  }

  .content {
    grid-area: content;
    align-self: top;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .unclaimed-project-notice {
    margin-bottom: 2rem;
  }

  .header {
    grid-area: header;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .header .owner {
    display: flex;
    gap: 0.375rem;
    align-items: center;
  }

  .stats {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .stats.loading {
    min-height: 6.125rem;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
  }

  .stats .stat {
    padding: 1rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    min-height: 6.125rem;
  }

  .become-supporter-card {
    position: sticky;
    top: 6rem;
  }

  .card {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .outgoing-splits {
    padding: 1.5rem;
  }

  .unclaimed-funds-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 1080px) {
    .project-profile {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto auto auto;
      gap: 3rem;
      grid-template-areas:
        'header'
        'sidebar'
        'content';
    }

    .header {
      margin-bottom: 0;
    }

    aside {
      height: auto;
    }
  }
</style>
