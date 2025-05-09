<script lang="ts" context="module">
  import { DRIP_LIST_BADGE_FRAGMENT } from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import { PROJECT_PROFILE_HEADER_FRAGMENT } from '$lib/components/project-profile-header/project-profile-header.svelte';
  import { SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT } from '$lib/components/splits/types';
  import { SUPPORT_CARD_PROJECT_FRAGMENT } from '$lib/components/support-card/support-card.svelte';
  import { SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT } from '$lib/components/supporters-section/supporters.section.svelte';
  import { UNCLAIMED_PROJECT_CARD_FRAGMENT } from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import { EDIT_PROJECT_METADATA_FLOW_FRAGMENT } from '$lib/flows/edit-project-metadata/edit-project-metadata-steps';
  import {
    EDIT_PROJECT_SPLITS_FLOW_ADDRESS_RECEIVER_FRAGMENT,
    EDIT_PROJECT_SPLITS_FLOW_DRIP_LIST_RECEIVER_FRAGMENT,
    EDIT_PROJECT_SPLITS_FLOW_PROJECT_RECEIVER_FRAGMENT,
  } from '$lib/flows/edit-project-splits/edit-project-splits-steps';

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
    ${MERGE_WITHDRAWABLE_BALANCES_FRAGMENT}
    ${SUPPORTER_PILE_FRAGMENT}
    fragment ProjectProfile on Project {
      ...UnclaimedProjectCard
      ...ProjectProfileHeader
      ...SupportCardProject
      ...EditProjectMetadataFlow
      account {
        accountId
      }
      chainData {
        ...SplitsComponentProjectSplits
        ... on UnClaimedProjectData {
          support {
            ...SupportersSectionSupportItem
            ...SupporterPile
          }
          withdrawableBalances {
            ...MergeWithdrawableBalances
          }
        }
        ... on ClaimedProjectData {
          owner {
            accountId
          }
          support {
            ...SupportersSectionSupportItem
            ...SupporterPile
          }
          totalEarned {
            tokenAddress
            amount
          }
          splits {
            dependencies {
              ... on AddressReceiver {
                ...EditProjectSplitsFlowAddressReceiver
              }
              ... on ProjectReceiver {
                ...EditProjectSplitsFlowProjectReceiver
              }
              ... on DripListReceiver {
                ...EditProjectSplitsFlowDripListReceiver
              }
            }
            maintainers {
              ... on AddressReceiver {
                ...EditProjectSplitsFlowAddressReceiver
              }
            }
          }
        }
      }
    }
  `;
</script>

<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SupportCard from '$lib/components/support-card/support-card.svelte';
  import ProjectProfileHeader from '$lib/components/project-profile-header/project-profile-header.svelte';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import SplitsComponent from '$lib/components/splits/splits.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Pile from '$lib/components/pile/pile.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import SupportersSection from '$lib/components/supporters-section/supporters.section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Button from '$lib/components/button/button.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import editProjectMetadataSteps from '$lib/flows/edit-project-metadata/edit-project-metadata-steps';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Registered from '$lib/components/icons/Registered.svelte';
  import buildUrl from '$lib/utils/build-url';
  import editProjectSplitsSteps from '$lib/flows/edit-project-splits/edit-project-splits-steps';
  import { fade } from 'svelte/transition';
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import isClaimed from '$lib/utils/project/is-claimed';
  import { gql } from 'graphql-request';
  import type { ProjectProfileFragment } from './__generated__/gql.generated';
  import unreachable from '$lib/utils/unreachable';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import highlightStore from '$lib/stores/highlight/highlight.store';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import DripListAvatar from '$lib/components/drip-list-avatar/drip-list-avatar.svelte';
  import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';
  import buildProjectUrl from '$lib/utils/build-project-url';
  import { Forge } from '$lib/graphql/__generated__/base-types';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import EyeOpen from '$lib/components/icons/EyeOpen.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import mergeWithdrawableBalances, {
    MERGE_WITHDRAWABLE_BALANCES_FRAGMENT,
  } from '$lib/utils/merge-withdrawable-balances';
  import getSupportersPile, {
    SUPPORTER_PILE_FRAGMENT,
  } from '$lib/components/drip-list-card/methods/get-supporters-pile';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import EyeClosed from '$lib/components/icons/EyeClosed.svelte';
  import configureProjectSupportButtonSteps from '$lib/flows/configure-project-support-button/configure-project-support-button-steps';
  import Settings from '$lib/components/icons/Settings.svelte';
  import type { SupportButtonData } from '$lib/components/project-support-button/project-support-button';
  import network from '$lib/stores/wallet/network';
  import { page } from '$app/stores';

  export let project: ProjectProfileFragment;
  export let description: string | undefined;

  interface RepoInfo {
    url: string;
    repoName: string;
    ownerName: string;
  }

  export let newRepo: RepoInfo | undefined;
  export let correctCasingRepo: RepoInfo | undefined;
  export let repoExists: boolean;

  $: ownAccountId = $walletStore.dripsAccountId;
  $: chainData = filterCurrentChainData(project.chainData);
  $: isOwnProject = ownAccountId === (isClaimed(chainData) ? chainData.owner.accountId : undefined);

  type ExtractFragment<T, Condition> = T extends Condition ? T : never;

  function getSplitsPile(
    splitCollections: (
      | ExtractFragment<
          ProjectProfileFragment['chainData'][number],
          { __typename: 'ClaimedProjectData' }
        >['splits']['maintainers']
      | ExtractFragment<
          ProjectProfileFragment['chainData'][number],
          { __typename: 'ClaimedProjectData' }
        >['splits']['dependencies']
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
              size: 'medium',
              disableLink: true,
            },
          };
        case 'ProjectReceiver':
          return {
            component: ProjectAvatar,
            props: {
              project: filterCurrentChainData(v.project.chainData),
              outline: true,
              isLinked: false,
            },
          };
        case 'DripListReceiver':
          return {
            component: DripListAvatar,
            props: { outline: true, isLinked: false },
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
        title: 'Collect received funds',
        description: 'You can collect funds to your wallet here.',
        element: document.querySelectorAll("[data-highlightid='global-collect']")[0],
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

  $: canonicalRepoInfo = newRepo ?? correctCasingRepo ?? project.source;

  let splitsSectionSkeleton: SectionSkeleton | undefined;
  let supportersSectionSkeleton: SectionSkeleton | undefined;

  const imageBaseUrl = `/api/share-images/project/${encodeURIComponent(project.source.url)}.png`;

  $: origin = browser ? window.location.origin : '';
  $: supportButtonStepConfig = {
    projectSourceUrl: project.source.url,
    supportButtonData: {
      dependencies: isClaimed(chainData) ? chainData.splits.dependencies.length.toString() : '0',
      projectName: project.source.repoName,
      projectUrl: `${origin}${buildProjectUrl(Forge.GitHub, project.source.ownerName, project.source.repoName, false)}`,
      projectData: chainData as SupportButtonData['projectData'],
    },
  };

  function handleEmbedButtonConfigureClick() {
    // don't focus the first selectable element
    // restored when modal is hidden
    modal.setFocusTrapped(false);
    modal.show(Stepper, undefined, configureProjectSupportButtonSteps(supportButtonStepConfig));
  }
</script>

<HeadMeta
  title="{project.source.ownerName}/{project.source.repoName}"
  description="Support {project.source
    .repoName} on Drips and help make Open-Source Software sustainable."
  image="{imageBaseUrl}?target=og"
  twitterImage="{imageBaseUrl}?target=twitter"
/>

<svelte:head>
  <!--
    Canonical URL is either, in order of priority:
    - The new repo URL if the project has been renamed
    - The correct-casing repo URL if the project has different casing to the Drips project
    - The project URL, without ?exact parameter
  -->
  <link
    rel="canonical"
    href="https://drips.network{buildProjectUrl(
      Forge.GitHub,
      canonicalRepoInfo.ownerName,
      canonicalRepoInfo.repoName,
      false,
    )}"
  />

  {#if !project.isVisible}
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>

<PrimaryColorThemer colorHex={isClaimed(chainData) ? chainData.color : undefined}>
  {#if newRepo}
    <div class="notice">
      <AnnotationBox>
        The GitHub repo for this project has been renamed to {newRepo.ownerName}/{newRepo.repoName}.
        <svelte:fragment slot="actions">
          <Button
            icon={ArrowRight}
            variant="primary"
            href={buildProjectUrl(Forge.GitHub, newRepo.ownerName, newRepo.repoName, false)}
            >Go to the new project</Button
          >
        </svelte:fragment>
      </AnnotationBox>
    </div>
  {/if}
  {#if correctCasingRepo}
    <div class="notice">
      <AnnotationBox>
        This project resolves to a GitHub repo with different casing ({correctCasingRepo.ownerName}/{correctCasingRepo.repoName}).
        Any new splits to this misnamed project will automatically be routed to the correct project.
        <svelte:fragment slot="actions">
          <Button
            size="small"
            icon={EyeOpen}
            variant="primary"
            href={buildProjectUrl(
              Forge.GitHub,
              correctCasingRepo.ownerName,
              correctCasingRepo.repoName,
              false,
            )}>View correct project</Button
          >
        </svelte:fragment>
      </AnnotationBox>
    </div>
  {/if}
  {#if !isClaimed(chainData) && repoExists}
    <div class="notice">
      <AnnotationBox type="info">
        {#if chainData.withdrawableBalances.length > 0}This project has <span
            class="typo-text-small-bold"
            ><AggregateFiatEstimate
              amounts={mergeWithdrawableBalances(chainData.withdrawableBalances)}
            /></span
          > in claimable funds. Project owners can collect by claiming their project.{:else}This
          project is unclaimed on {network.label}, but can still receive funds that the owner can
          collect later.{/if}
        <svelte:fragment slot="actions">
          <div class="flex gap-3">
            <ShareButton
              url={browser ? window.location.href : ''}
              downloadableImageUrl="{imageBaseUrl}?target=og"
              supportButtonOptions={supportButtonStepConfig}
            />
            <Button
              size="small"
              icon={Registered}
              variant="primary"
              on:click={() =>
                $walletStore.connected
                  ? modal.show(ClaimProjectStepper, undefined, {
                      skipWalletConnect: true,
                      projectUrl: project.source.url,
                    })
                  : goto(buildUrl('/app/claim-project', { projectToAdd: project.source.url }))}
              >Claim project</Button
            >
          </div>
        </svelte:fragment>
      </AnnotationBox>
    </div>
  {/if}
  {#if !repoExists}
    <div class="notice">
      <AnnotationBox type="error">
        This project has previously {isClaimed(chainData) ? 'been claimed' : 'received funds'}, but
        the underlying GitHub repo has been either deleted or made private. It cannot be donated to {isClaimed(
          chainData,
        )
          ? ''
          : 'or claimed '}until a repo with the same name is publicly available on GitHub again.
      </AnnotationBox>
    </div>
  {/if}
  {#if !project.isVisible}
    <div class="notice">
      <AnnotationBox type="info" icon={EyeClosed}>
        <span class="typo-text-small-bold"
          >{project.source.ownerName}/{project.source.repoName}</span
        >
        has been hidden by its owner.
        <a
          style="text-decoration: underline;"
          target="_blank"
          href="https://docs.drips.network/advanced/drip-list-and-project-visibility">Learn more</a
        >.
        <svelte:fragment slot="actions">
          {#if isOwnProject}
            <div class="flex gap-3">
              <Button
                size="small"
                icon={Registered}
                variant="primary"
                on:click={() => {
                  modal.show(Stepper, undefined, editProjectMetadataSteps(project));
                }}>Unhide it</Button
              >
            </div>
          {/if}
        </svelte:fragment>
      </AnnotationBox>
    </div>
  {/if}

  <article
    class="project-profile"
    class:claimed={isClaimed(chainData)}
    class:hidden-by-user={!project.isVisible || !repoExists}
  >
    <header class="header">
      <div>
        <ProjectProfileHeader
          {project}
          {description}
          editButton={isClaimed(chainData) && isOwnProject ? 'Edit' : undefined}
          shareButton={{
            url: `${origin}${buildProjectUrl(
              Forge.GitHub,
              project.source.ownerName,
              project.source.repoName,
              false,
            )}`,
            supportButtonOptions: supportButtonStepConfig,
            downloadableImageUrl: `${imageBaseUrl}?target=og`,
          }}
          on:editButtonClick={() =>
            isClaimed(chainData) &&
            modal.show(Stepper, undefined, editProjectMetadataSteps(project))}
        />
      </div>

      {#if isClaimed(chainData)}
        <div class="stats" in:fade={{ duration: 300 }}>
          <div class="stat shadow-low rounded-drip-lg">
            <KeyValuePair key="Donations">
              <AggregateFiatEstimate amounts={chainData.totalEarned} />
            </KeyValuePair>
          </div>
          <!-- ("Supporters" stat) -->
          {#if [chainData.support].flat().length > 0}
            <a
              class="stat btn-theme-outlined"
              href="#support"
              on:click={() => supportersSectionSkeleton?.highlightSection()}
            >
              <KeyValuePair key="Supporters">
                <Pile maxItems={4} components={getSupportersPile(chainData.support)} />
              </KeyValuePair>
            </a>
          {/if}
          <!-- ("Splits with" stat) -->
          {#if [chainData.splits.maintainers, chainData.splits.dependencies].flat().length > 0}
            <a
              class="stat btn-theme-outlined"
              href="#splits"
              on:click={() => splitsSectionSkeleton?.highlightSection()}
            >
              <KeyValuePair key="Splits with">
                <Pile
                  maxItems={4}
                  components={getSplitsPile([
                    chainData.splits.maintainers ?? [],
                    chainData.splits.dependencies ?? [],
                  ])}
                />
              </KeyValuePair>
            </a>
          {/if}
        </div>
        {#if isOwnProject}
          <AnnotationBox type="info">
            Embed a support button on your website.
            <svelte:fragment slot="actions">
              <Button variant="primary" icon={Settings} on:click={handleEmbedButtonConfigureClick}
                >Configure</Button
              >
            </svelte:fragment>
          </AnnotationBox>
        {/if}
      {/if}
    </header>
    <div class="content">
      <Developer accountId={project.account.accountId} />
      {#if isClaimed(chainData)}
        <section id="splits" class="app-section">
          <SectionHeader
            icon={DripList}
            label="Splits"
            actions={isOwnProject
              ? [
                  {
                    handler: () =>
                      isClaimed(chainData) &&
                      modal.show(
                        Stepper,
                        undefined,
                        isClaimed(chainData)
                          ? editProjectSplitsSteps(
                              project.account.accountId,
                              project.source.url,
                              chainData.splits,
                            )
                          : unreachable(),
                      ),
                    label: 'Edit',
                    icon: Pen,
                  },
                ]
              : []}
          />
          <SectionSkeleton
            bind:this={splitsSectionSkeleton}
            loaded={true}
            empty={chainData.splits.maintainers.length === 0 &&
              chainData.splits.dependencies.length === 0}
            emptyStateHeadline="No splits"
            emptyStateEmoji="🫧"
            emptyStateText="This project isnʼt sharing incoming funds with any maintainers or dependencies."
          >
            <div class="card">
              <div class="p-6">
                <ProjectBadge tooltip={false} {project} />
                <div class="pl-3.5 mt-2.5">
                  {#key $page.url.pathname}
                    <SplitsComponent
                      disableLinks={false}
                      list={[
                        {
                          __typename: 'SplitGroup',
                          name: 'Maintainers',
                          list: chainData.splits.maintainers,
                        },
                        {
                          __typename: 'SplitGroup',
                          name: 'Dependencies',
                          list: chainData.splits.dependencies,
                        },
                      ]}
                    />
                  {/key}
                </div>
              </div>
            </div>
          </SectionSkeleton>
        </section>
      {:else if chainData.withdrawableBalances.length > 0}
        <section class="app-section">
          <SectionHeader icon={Wallet} label="Claimable funds" />
          <SectionSkeleton loaded={true}>
            <div class="unclaimed-funds-section">
              <UnclaimedProjectCard
                {project}
                unclaimedTokensExpandable={false}
                unclaimedTokensExpanded={chainData.withdrawableBalances.length > 0}
                showClaimButton={repoExists}
                on:claimButtonClick={() =>
                  goto(buildUrl('/app/claim-project', { projectToAdd: project.source.url }))}
              />
            </div>
          </SectionSkeleton>
        </section>
      {/if}
      <section id="support">
        <SupportersSection
          bind:sectionSkeleton={supportersSectionSkeleton}
          type="project"
          supportItems={chainData.support}
        />
      </section>
    </div>
    <aside>
      <div class="become-supporter-card">
        <SupportCard
          {project}
          disabled={!!newRepo || !!correctCasingRepo || !project.isVisible || !repoExists}
        />
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

  .notice {
    margin-bottom: 2rem;
  }

  .header {
    grid-area: header;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .stats {
    width: calc(100% + 32px);
    margin: -16px 0 -16px -16px;
    padding: 16px;
    overflow: scroll;
    white-space: nowrap;
  }

  .stats .stat {
    display: inline-flex;
    padding: 1rem;
    min-height: 6.125rem;
  }
  .stats .stat + .stat {
    margin-left: 0.5rem;
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

  .unclaimed-funds-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hidden-by-user {
    opacity: 0.5;
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
