<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SplitsIcon from 'radicle-design-system/icons/Splits.svelte';
  import SupportCard from '$lib/components/support-card/support-card.svelte';
  import ProjectProfileHeader from '$lib/components/project-profile-header/project-profile-header.svelte';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import type {
    Splits,
    Split,
    AddressSplit,
    DripListSplit,
    ProjectSplit,
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
  import buildUrl from '$lib/utils/build-url';
  import editProjectSplitsSteps from '$lib/flows/edit-project-splits/edit-project-splits-steps';
  import { fade } from 'svelte/transition';
  import type getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import { goto } from '$app/navigation';
  import Link from 'radicle-design-system/icons/Link.svelte';
  import Copyable from '$lib/components/copyable/copyable.svelte';
  import { browser } from '$app/environment';
  import type { ClaimedGitProject, GitProject as Project } from '$lib/utils/git-project/types';
  import { ProjectVerificationStatus } from '$lib/graphql/generated/graphql';

  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  export let project: Project;

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
  $: isOwnProject = ownAccountId === (project as ClaimedGitProject).ownerAccountId ?? undefined;

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
  title="{project.ownerName}/{project.repoName}"
  description="Support {project.repoName} on Drips and help make Open-Source Software sustainable."
/>

<PrimaryColorThemer
  colorHex={project.verificationStatus === ProjectVerificationStatus.Claimed
    ? project.color
    : undefined}
>
  <div
    class="project-profile"
    class:claimed={project.verificationStatus === ProjectVerificationStatus.Claimed}
  >
    <div class="header">
      {#if project.verificationStatus === ProjectVerificationStatus.Claimed}
        <div class="owner">
          <span class="typo-text" style:color="var(--color-foreground-level-5)"
            >Project claimed by</span
          >
          <IdentityBadge address={project.ownerAddress} />
        </div>
      {:else}
        <div class="unclaimed-project-notice">
          <AnnotationBox type="info">
            {#await unclaimedFunds}
              <span />
            {:then result}
              {#if result?.length}This project has <span class="typo-text-small-bold"
                  ><AggregateFiatEstimate amounts={result} /></span
                > in available funds! Project owners can collect by claiming their project.{:else}This
                project has not been claimed yet but can still receive funds that the owner can
                collect later.{/if}
            {:catch}
              This project is unclaimed.
            {/await}
            <svelte:fragment slot="actions">
              <div class="flex gap-3">
                <Copyable value={browser ? window.location.href : ''}>
                  <div class="flex gap-1 items-center">
                    <Link style="fill:currentColor" />
                    <div class="whitespace-nowrap">Copy URL</div>
                  </div>
                </Copyable>
                <Button
                  size="small"
                  icon={Registered}
                  variant="primary"
                  on:click={() =>
                    goto(buildUrl('/app/claim-project', { projectToAdd: project.url }))}
                  >Claim project</Button
                >
              </div>
            </svelte:fragment>
          </AnnotationBox>
        </div>
      {/if}
      <div class="project-profile-header">
        <ProjectProfileHeader {project} />
        {#if project.verificationStatus === ProjectVerificationStatus.Claimed && isOwnProject}
          <Button
            icon={Pen}
            on:click={() =>
              project.verificationStatus === ProjectVerificationStatus.Claimed &&
              modal.show(Stepper, undefined, editProjectMetadataSteps(project))}>Edit</Button
          >
        {/if}
      </div>
      {#if project.verificationStatus === ProjectVerificationStatus.Claimed}
        {#await Promise.all([earnedFunds, splits])}
          <div class="stats loading">
            <Spinner />
          </div>
        {:then [earnedFundsResult, splitsResult]}
          <div class="stats" in:fade|local={{ duration: 300 }}>
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
      <Developer accountId={project.id} />
      {#if project.verificationStatus === ProjectVerificationStatus.Claimed}
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
                          project.verificationStatus === ProjectVerificationStatus.Claimed &&
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
                emptyStateText="This project isnʼt sharing incoming funds with any maintainers or dependencies."
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
                  unclaimedFunds={result}
                  unclaimedTokensExpandable={false}
                  unclaimedTokensExpanded={result.length > 0}
                  showClaimButton
                  on:claimButtonClick={() =>
                    goto(buildUrl('/app/claim-project', { projectToAdd: project.url }))}
                />
              </div>
            </SectionSkeleton>
          {:catch}
            <SectionSkeleton loaded={true} error={true} />
          {/await}
        </div>
      {/if}
      <SupportersSection type="project" {incomingSplits} />
    </div>
    {#if project.verificationStatus === ProjectVerificationStatus.Claimed}
      <aside>
        <div class="become-supporter-card">
          <SupportCard {project} />
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
    gap: 3rem;
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
    }

    .project-profile.claimed {
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
  }
</style>
