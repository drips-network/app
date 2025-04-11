<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const ECOSYSTEM_PROFILE_FRAGMENT = gql`
    ${STREAM_STATE_STREAM_FRAGMENT}
    ${CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT}
    fragment EcosystemProfile on EcosystemMainAccount {
      account {
        accountId
        driver
      }
      name
      description
      creator
      support {
        ... on OneTimeDonationSupport {
          account {
            accountId
            address
          }
          amount {
            amount
            tokenAddress
          }
          date
        }
        ... on StreamSupport {
          stream {
            ...StreamStateStream
            config {
              amountPerSecond {
                amount
                tokenAddress
              }
              dripId
            }
            createdAt
            sender {
              account {
                accountId
                address
              }
            }
            timeline {
              ...CurrentAmountsTimelineItem
            }
          }
          date
        }
      }
    }
  `;
</script>

<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SupportCard from '$lib/components/support-card/support-card.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import EcosystemProfileHeader from './ecosystem-profile-header.svelte';
  import EcosystemCardInteractive from './ecosystem-card-interactive.svelte';
  import EcosystemMetadata from './ecosystem-metadata.svelte';
  import EcosystemDistribution from './ecosystem-distribution/ecosystem-distribution.svelte';
  import SupportersSection from '$lib/components/supporters-section/supporters.section.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import type { EcosystemProfileFragment } from './__generated__/gql.generated';
  import getSupportersPile from '$lib/components/drip-list-card/methods/get-supporters-pile';
  import Pile from '$lib/components/pile/pile.svelte';
  import { STREAM_STATE_STREAM_FRAGMENT } from '$lib/utils/stream-state';
  import { CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT } from '$lib/utils/current-amounts';
  // src/routes/(pages)/app/(app)/ecosystems/[ecosystemId]/components/__generated__/gql.generated.ts

  export let ecosystem: Ecosystem;
  export let ecosystemFragment: EcosystemProfileFragment | undefined;

  $: ecosystemSupport = ecosystemFragment?.support || [];
  // export let project: ProjectProfileFragment;

  // interface RepoInfo {
  //   url: string;
  //   repoName: string;
  //   ownerName: string;
  // }

  // export let newRepo: RepoInfo | undefined;
  // export let correctCasingRepo: RepoInfo | undefined;

  // $: ownAccountId = $walletStore.dripsAccountId;
  // $: chainData = filterCurrentChainData(project.chainData);
  // $: isOwnProject = ownAccountId === (isClaimed(chainData) ? chainData.owner.accountId : undefined);

  // type ExtractFragment<T, Condition> = T extends Condition ? T : never;

  // function getSplitsPile(
  //   splitCollections: (
  //     | ExtractFragment<
  //         ProjectProfileFragment['chainData'][number],
  //         { __typename: 'ClaimedProjectData' }
  //       >['splits']['maintainers']
  //     | ExtractFragment<
  //         ProjectProfileFragment['chainData'][number],
  //         { __typename: 'ClaimedProjectData' }
  //       >['splits']['dependencies']
  //   )[],
  // ) {
  //   const splits = splitCollections.flat();

  //   return mapFilterUndefined(splits, (v) => {
  //     switch (v.__typename) {
  //       case 'AddressReceiver':
  //         return {
  //           component: IdentityBadge,
  //           props: {
  //             address: v.account.address,
  //             showIdentity: false,
  //             size: 'medium',
  //             disableLink: true,
  //           },
  //         };
  //       case 'ProjectReceiver':
  //         return {
  //           component: ProjectAvatar,
  //           props: {
  //             project: filterCurrentChainData(v.project.chainData),
  //             outline: true,
  //             isLinked: false,
  //           },
  //         };
  //       case 'DripListReceiver':
  //         return {
  //           component: DripListAvatar,
  //           props: { outline: true, isLinked: false },
  //         };
  //       default:
  //         return undefined;
  //     }
  //   });
  // }

  // $: mobileView =
  //   $breakpointsStore?.breakpoint === 'mobile' || $breakpointsStore?.breakpoint === 'tablet';

  // let collectHintTriggered = false;

  // function triggerCollectHint() {
  //   collectHintTriggered = true;

  //   setTimeout(() => {
  //     highlightStore.highlight({
  //       title: 'Collect received funds',
  //       description: 'You can collect funds to your wallet here.',
  //       element: document.querySelectorAll("[data-highlightid='global-collect']")[0],
  //       borderRadius: mobileView ? '1rem 0 1rem 1rem' : '2rem 0 2rem 2rem',
  //       paddingPx: mobileView ? 8 : 0,
  //     });
  //   }, 2000);
  // }

  // const walletInitialized = walletStore.initialized;

  // $: {
  //   if (browser && !collectHintTriggered && $walletInitialized) {
  //     let url = new URL(window.location.href);

  //     if (url.searchParams.get('collectHint') === 'true') {
  //       url.searchParams.delete('collectHint');
  //       window.history.replaceState({}, '', url.toString());

  //       if (!dismissablesStore.isDismissed('project-claim-collect-hint')) {
  //         triggerCollectHint();
  //         dismissablesStore.dismiss('project-claim-collect-hint');
  //       }
  //     }
  //   }
  // }

  // $: canonicalRepoInfo = newRepo ?? correctCasingRepo ?? project.source;

  // let splitsSectionSkeleton: SectionSkeleton | undefined;
  let supportersSectionSkeleton: SectionSkeleton | undefined;

  // TODO: fix
  const imageBaseUrl = `/api/share-images/project/${encodeURIComponent('TODO')}.png`;

  // $: origin = browser ? window.location.origin : '';
  // $: supportButtonStepConfig = {
  //   projectSourceUrl: project.source.url,
  //   supportButtonData: {
  //     dependencies: isClaimed(chainData) ? chainData.splits.dependencies.length.toString() : '0',
  //     projectName: project.source.repoName,
  //     projectUrl: `${origin}${buildProjectUrl(Forge.GitHub, project.source.ownerName, project.source.repoName, false)}`,
  //     projectData: chainData as SupportButtonData['projectData'],
  //   },
  // };

  $: colorHex = ecosystem.color ? ecosystem.color : undefined;

  const recipientsFormatter = new Intl.NumberFormat('en-US');
  // all nodes except the root node
  $: recipientsFormatted = recipientsFormatter.format(
    ecosystem.graph ? ecosystem.graph.nodes.length - 1 : 0,
  );

  // function buildEcosystemUrl() {
  //   return window.
  // }
</script>

<HeadMeta
  title={ecosystem.name}
  description="Support {ecosystem.name} on Drips and help make Open-Source Software sustainable."
  image="{imageBaseUrl}?target=og"
  twitterImage="{imageBaseUrl}?target=twitter"
/>

<svelte:head>
  <link rel="canonical" href={`https://drips.network/app/ecosystems/${ecosystem.id}`} />
</svelte:head>

<PrimaryColorThemer colorHex={ecosystem.color}>
  <article class="project-profile">
    <header class="header card">
      <div>
        <EcosystemProfileHeader {ecosystem} />
      </div>

      <div class="stats">
        <div class="stat drip-bordered">
          <KeyValuePair key="Donations">$186,833.91</KeyValuePair>
        </div>
        <div class="stat drip-bordered">
          <KeyValuePair key="Recipients">{recipientsFormatted}</KeyValuePair>
        </div>
        <div class="stat drip-bordered">
          <!-- ("Supporters" stat) -->
          {#if [ecosystemSupport].flat().length > 0}
            <a
              class="stat btn-theme-outlined"
              href="#support"
              on:click={() => supportersSectionSkeleton?.highlightSection()}
            >
              <KeyValuePair key="Supporters">
                <Pile maxItems={4} components={getSupportersPile(ecosystemSupport)} />
              </KeyValuePair>
            </a>
          {/if}
        </div>
      </div>

      <!-- {#if isClaimed(chainData)}
        <div class="stats" in:fade={{ duration: 300 }}>
          <div class="stat shadow-low rounded-drip-lg">
            <KeyValuePair key="Donations">
              <AggregateFiatEstimate amounts={chainData.totalEarned} />
            </KeyValuePair>
          </div>
          ("Supporters" stat)
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
          ("Splits with" stat)
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
      {/if} -->
    </header>
    <section id="graph">
      <PrimaryColorThemer {colorHex}>
        <EcosystemCardInteractive {ecosystem} />
      </PrimaryColorThemer>
    </section>
    <section id="metadata">
      <PrimaryColorThemer {colorHex}>
        <EcosystemMetadata {ecosystem} />
      </PrimaryColorThemer>
    </section>
    <section id="distribution">
      <PrimaryColorThemer {colorHex}>
        <EcosystemDistribution {ecosystem} />
      </PrimaryColorThemer>
    </section>

    <!-- <Developer accountId={project.account.accountId} /> -->
    <!-- {#if isClaimed(chainData)}
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
                <ProjectBadge {project} />
                <div class="pl-3.5 mt-2.5">
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
                showClaimButton
                on:claimButtonClick={() =>
                  goto(buildUrl('/app/claim-project', { projectToAdd: project.source.url }))}
              />
            </div>
          </SectionSkeleton>
        </section>
      {/if} -->
    <section id="support">
      <PrimaryColorThemer {colorHex}>
        <SupportersSection
          bind:sectionSkeleton={supportersSectionSkeleton}
          type="ecosystem"
          supportItems={ecosystemSupport}
        />
      </PrimaryColorThemer>
    </section>
    <aside>
      <div class="become-supporter-card">
        <SupportCard {ecosystem} disabled={false} />
      </div>
    </aside>
  </article>
</PrimaryColorThemer>

<style>
  .project-profile > * {
    min-width: 0;
  }

  .project-profile {
    display: grid;
    grid-template-columns: 3fr minmax(auto, 18rem);
    gap: 3rem;
  }

  .project-profile > * {
    max-width: 100%;
  }

  section {
    grid-column: span 2;
  }

  aside {
    grid-row-start: 1;
    grid-column-start: 2;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    justify-content: space-between;
  }

  .stats {
    overflow: scroll;
    gap: 1.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .stats .stat {
    padding: 1rem;
    min-height: 6.125rem;
    flex-grow: 1;
    flex-basis: 33%;
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

  @media (max-width: 1080px) {
    .header {
      margin-bottom: 0;
    }

    aside {
      height: auto;
    }

    .project-profile {
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
