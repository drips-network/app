<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SplitsIcon from 'radicle-design-system/icons/Splits.svelte';
  import BecomeSupporterCard from '../become-supporter-card/become-supporter-card.svelte';
  import ProjectProfileHeader from '$lib/components/project-profile-header/project-profile-header.svelte';
  import type { GitProject } from '$lib/utils/metadata/types';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import type {
    Splits,
    Split,
    AddressSplit,
    ProjectSplit,
    DripListSplit,
  } from '$lib/components/splits/splits.svelte';
  import SplitsComponent from '$lib/components/splits/splits.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Pile from '$lib/components/pile/pile.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import SupportersSection from '$lib/components/supporters-section/supporters.section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Button from '$lib/components/button/button.svelte';
  import Pen from 'radicle-design-system/icons/Pen.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import editProjectMetadataSteps from '$lib/flows/edit-project-metadata/edit-project-metadata-steps';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Registered from 'radicle-design-system/icons/Registered.svelte';
  import OneContract from '$lib/components/illustrations/one-contract.svelte';
  import buildUrl from '$lib/utils/build-url';
  import editProjectSplitsSteps from '$lib/flows/edit-project-splits/edit-project-splits-steps';
  import { fade } from 'svelte/transition';
  import type getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
  import Developer from '$lib/components/developer-section/developer.section.svelte';

  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  export let project: GitProject;

  export let unclaimedFunds: Promise<Amount[]> | undefined = undefined;
  export let earnedFunds: Promise<Amount[]> | undefined = undefined;

  export let splits:
    | Promise<{
        maintainers: (AddressSplit | ProjectSplit | DripListSplit)[];
        dependencies: (AddressSplit | ProjectSplit | DripListSplit)[];
      } | null>
    | undefined = undefined;

  export let incomingSplits: ReturnType<typeof getIncomingSplits>;

  $: ownAccountId = $walletStore.dripsAccountId;
  $: isOwnProject = ownAccountId === project.owner?.accountId;

  function flattenSplits(list: Splits): Split[] {
    return list.reduce<Split[]>((acc, i) => {
      if (i.type === 'split-group') {
        return [...acc, ...flattenSplits(i.list)];
      }
      return [...acc, i];
    }, []);
  }

  function getSplitsPile(splitCollections: Splits[]) {
    const splits = splitCollections.flat();
    const flattened = flattenSplits(splits);

    return mapFilterUndefined(flattened, (v) => {
      switch (v.type) {
        case 'address-split':
          return {
            component: IdentityBadge,
            props: {
              address: v.address,
              showIdentity: false,
              outline: true,
              size: 'medium',
            },
          };
        case 'project-split':
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
</script>

<HeadMeta
  title="{project.source.ownerName}/{project.source.repoName}"
  description="Support {project.source
    .repoName} on Drips and help make Open-Source Software sustainable."
/>

<PrimaryColorThemer colorHex={project.owner ? project.color : undefined}>
  <div class="project-profile" class:claimed={project.claimed}>
    <div class="header">
      {#if project.owner}
        <div class="owner">
          <IdentityBadge address={project.owner.address} />
          <span class="typo-text" style:color="var(--color-foreground-level-5)"
            >is raising funds for...</span
          >
        </div>
      {:else}
        <div class="unclaimed-project-notice">
          <AnnotationBox>
            This project is unclaimed. Know the owner? Share it with them to collect claimable funds
            and start fundraising on Drips.
          </AnnotationBox>
        </div>
      {/if}
      <div class="project-profile-header">
        <ProjectProfileHeader {project} />
        {#if project.claimed && isOwnProject}
          <Button
            icon={Pen}
            on:click={() =>
              project.claimed && modal.show(Stepper, undefined, editProjectMetadataSteps(project))}
            >Edit</Button
          >
        {/if}
      </div>
      {#if project.claimed}
        {#await Promise.all([earnedFunds, splits])}
          <div class="stats loading">
            <Spinner />
          </div>
        {:then [earnedFundsResult, splitsResult]}
          <div class="stats" in:fade={{ duration: 300 }}>
            {#if earnedFundsResult}
              <div class="stat">
                <KeyValuePair key="Total income">
                  <AggregateFiatEstimate amounts={earnedFundsResult} />
                </KeyValuePair>
              </div>
            {/if}
            {#if splitsResult}
              <div class="stat">
                <KeyValuePair key="Splits with">
                  {#if splitsResult && [splitsResult.maintainers, splitsResult.dependencies].flat().length > 0}
                    <Pile
                      maxItems={5}
                      components={getSplitsPile([
                        splitsResult.maintainers,
                        splitsResult.dependencies,
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
    </div>
    <div class="content">
      <Developer accountId={project.repoDriverAccount.accountId} />
      {#if project.owner}
        <div class="section">
          {#if splits}
            {#await splits}
              <SectionHeader icon={SplitsIcon} label="Splits" />
              <SectionSkeleton loaded={false} />
            {:then result}
              <SectionHeader
                icon={SplitsIcon}
                label="Splits"
                actions={isOwnProject
                  ? [
                      {
                        handler: () =>
                          project.claimed &&
                          result &&
                          modal.show(Stepper, undefined, editProjectSplitsSteps(project, result)),
                        label: 'Edit',
                        icon: Pen,
                      },
                    ]
                  : []}
              />
              <SectionSkeleton
                loaded={true}
                error={result === null}
                empty={result
                  ? result.maintainers.length === 0 && result.dependencies.length === 0
                  : false}
                emptyStateHeadline="No splits"
                emptyStateEmoji="🫧"
                emptyStateText="This project isn't sharing incoming funds with any maintainers or dependencies."
              >
                {#if result}
                  <div class="card">
                    <div class="outgoing-splits">
                      <ProjectBadge {project} />
                      <SplitsComponent
                        list={[
                          {
                            type: 'split-group',
                            name: 'Maintainers',
                            list: result.maintainers,
                          },
                          {
                            type: 'split-group',
                            name: 'Dependencies',
                            list: result.dependencies,
                          },
                        ]}
                      />
                    </div>
                  </div>
                {/if}
              </SectionSkeleton>
            {:catch}
              <SectionHeader icon={SplitsIcon} label="Splits" />
              <SectionSkeleton loaded={true} error={true} />
            {/await}
          {/if}
        </div>
      {:else if unclaimedFunds}
        <div class="section">
          <SectionHeader icon={Wallet} label="Claimable funds" />
          {#await unclaimedFunds}
            <SectionSkeleton loaded={false} />
          {:then result}
            <SectionSkeleton loaded={true}>
              <div class="unclaimed-funds-section">
                <UnclaimedProjectCard
                  unclaimedTokensExpanded={result.length > 0}
                  unclaimedFunds={result}
                />
                <div class="unclaimed-project-edu-card">
                  <div class="illustration"><OneContract /></div>
                  <div class="edu-card-content">
                    <div class="text">
                      <h3>Are you a maintainer of {project.source.repoName}?</h3>
                      <p>
                        Claim your repository on Drips to raise funds from supporters, configure
                        your project's dependencies and help build the Drips Dependency Tree.
                      </p>
                      <a
                        href="https://docs.drips.network/docs/for-fundraisers/how-to-claim-a-project"
                        class="typo-text-small learn-more-link"
                        target="_blank">Learn more</a
                      >
                    </div>
                    <a
                      href={buildUrl('/app/claim-project', { projectToAdd: project.source.url })}
                      class="claim-button"
                    >
                      <Button icon={Registered} variant="primary">Claim project</Button>
                    </a>
                  </div>
                </div>
              </div>
            </SectionSkeleton>
          {:catch}
            <SectionSkeleton loaded={true} error={true} />
          {/await}
        </div>
      {/if}
      <SupportersSection type="project" {incomingSplits} />
    </div>
    {#if project.owner}
      <aside>
        <div class="become-supporter-card">
          <BecomeSupporterCard {project} />
        </div>
      </aside>
    {/if}
  </div>
</PrimaryColorThemer>

<style>
  .project-profile {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      'header'
      'content';
    gap: 2rem;
  }

  .project-profile.claimed {
    grid-template-columns: 3fr minmax(auto, 18rem);
    grid-template-rows: auto auto;
    grid-template-areas:
      'header sidebar'
      'content sidebar';
  }

  .project-profile > * {
    max-width: 100%;
  }

  .content {
    grid-area: content;
    align-self: top;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .unclaimed-project-notice {
    margin-bottom: 2rem;
  }

  .header {
    grid-area: header;
    margin-bottom: 2rem;
  }

  .header .project-profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .header .owner {
    display: flex;
    gap: 0.375rem;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .stats {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 2rem;
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

  aside {
    grid-area: sidebar;
  }

  .become-supporter-card {
    position: sticky;
    top: 0;
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

  .unclaimed-project-edu-card {
    padding: 1rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .unclaimed-project-edu-card .illustration {
    height: 12rem;
    width: 12rem;
    flex-shrink: 0;
    background-color: var(--color-primary-level-1);
    border-radius: 1rem 0 1rem 1rem;
  }

  .unclaimed-project-edu-card .edu-card-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: space-between;
  }

  .unclaimed-project-edu-card .learn-more-link {
    color: var(--color-foreground-level-6);
    text-decoration: underline;
  }

  .unclaimed-project-edu-card .claim-button {
    display: flex;
    justify-content: flex-end;
  }

  .unclaimed-project-edu-card .edu-card-content .text {
    display: flex;
    padding-right: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .section {
    display: flex;
    gap: 2rem;
    flex-direction: column;
  }

  @media (max-width: 1024px) {
    .project-profile,
    .project-profile.claimed {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto auto auto;
      grid-template-areas:
        'header'
        'sidebar'
        'content';
    }

    .header {
      margin-bottom: 0;
    }

    .header .project-profile-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-direction: column;
    }

    aside {
      padding-bottom: 2rem;
    }

    .unclaimed-project-edu-card {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
