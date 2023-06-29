<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Heart from 'radicle-design-system/icons/Heart.svelte';
  import SplitsIcon from 'radicle-design-system/icons/Splits.svelte';
  import BecomeSupporterCard from '../become-supporter-card/become-supporter-card.svelte';
  import ProjectProfileHeader from '$lib/components/project-profile-header/project-profile-header.svelte';
  import type { GitProject } from '$lib/utils/metadata/types';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import type { Splits, Split } from '$lib/components/splits/splits.svelte';
  import SplitsComponent from '$lib/components/splits/splits.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Pile from '$lib/components/pile/pile.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import type getIncomingSplits from '../../../../(wallet-required)/(app)/projects/(forges)/methods/get-incoming-splits';
  import { getSplitPercent } from '$lib/utils/get-split-percent';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';

  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  export let project: GitProject;

  export let unclaimedFunds: Promise<Amount[]> | undefined = undefined;
  export let earnedFunds: Promise<Amount[]> | undefined = undefined;

  export let splits: Promise<{ maintainers: Splits; dependencies: Splits } | null> | undefined =
    undefined;

  export let incomingSplits: ReturnType<typeof getIncomingSplits>;

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
            },
          };
        case 'project-split':
          return {
            component: ProjectAvatar,
            props: {
              project: v.project,
            },
          };
        default:
          return undefined;
      }
    });
  }

  function flattenIncomingSplits(incomingSplits: Awaited<ReturnType<typeof getIncomingSplits>>) {
    return [
      ...incomingSplits.dripLists.map((v) => ({ type: 'dripList' as const, item: v })),
      ...incomingSplits.projects.map((v) => ({ type: 'project' as const, item: v })),
      ...incomingSplits.users.map((v) => ({ type: 'user' as const, item: v })),
    ];
  }
</script>

<HeadMeta
  title="{project.source.ownerName}/{project.source.repoName} | Drips"
  description="Support {project.source
    .repoName} on Drips and help make Open-Source Software sustainable."
/>

<!-- TODO: Add claim project button -->
<!-- TODO: Display supporters on unclaimed projects -->

<PrimaryColorThemer colorHex={project.owner ? project.color : undefined}>
  <div class="project-profile">
    <div class="header">
      {#if project.owner}
        <div class="owner">
          <IdentityBadge address={project.owner.address} /> is raising funds for...
        </div>
      {/if}
      <ProjectProfileHeader {project} />
      {#if project.claimed}
        <div class="stats">
          {#if earnedFunds}
            <div class="stat">
              {#await earnedFunds}
                <div class="loading">
                  <Spinner />
                </div>
              {:then result}
                <KeyValuePair key="Total income">
                  <AggregateFiatEstimate amounts={result} />
                </KeyValuePair>
              {/await}
            </div>
          {/if}
          {#if splits}
            <div class="stat">
              {#await splits}
                <div class="loading">
                  <Spinner />
                </div>
              {:then result}
                <KeyValuePair key="Splits with">
                  {#if result && [result.maintainers, result.dependencies].flat().length > 0}
                    <Pile
                      maxItems={5}
                      components={getSplitsPile([result.maintainers, result.dependencies])}
                    />
                  {:else}
                    None
                  {/if}
                </KeyValuePair>
              {/await}
            </div>
          {/if}
        </div>
      {/if}
    </div>
    <div class="content">
      {#if project.owner}
        <div class="section">
          <SectionHeader icon={Heart} label="Supporters" />
          {#await incomingSplits}
            <SectionSkeleton loaded={false} />
          {:then result}
            <SectionSkeleton loaded={true} empty={flattenIncomingSplits(result).length === 0}>
              <!-- TODO: Limit supporters list to some max amount, make expandable -->
              <div class="supporters-list">
                {#each flattenIncomingSplits(result) as incomingSplit}
                  <div class="item">
                    {#if incomingSplit.type === 'user'}
                      <IdentityBadge address={incomingSplit.item.value.address} />
                    {:else if incomingSplit.type === 'dripList'}
                      <IdentityBadge
                        size="medium"
                        address={incomingSplit.item.value.account.owner}
                      />
                    {:else if incomingSplit.type === 'project'}
                      <ProjectBadge project={incomingSplit.item.value} />
                    {/if}
                    <span class="muted"
                      >{getSplitPercent(incomingSplit.item.weight)}% of {incomingSplit.type ===
                      'dripList'
                        ? 'donations'
                        : 'income'}</span
                    >
                  </div>
                {/each}
              </div>
            </SectionSkeleton>
          {/await}
        </div>
        <div class="section">
          <SectionHeader icon={SplitsIcon} label="Splits" />
          {#if splits}
            {#await splits}
              <SectionSkeleton loaded={false} />
            {:then result}
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
              <UnclaimedProjectCard
                unclaimedTokensExpanded={result.length > 0}
                unclaimedFunds={result}
              />
            </SectionSkeleton>
          {/await}
        </div>
      {/if}
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
    grid-template-columns: 3fr minmax(auto, 18rem);
    grid-template-rows: auto auto;
    grid-template-areas:
      'header sidebar'
      'content sidebar';
    gap: 2rem;
  }

  .content {
    grid-area: content;
    align-self: top;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .header {
    grid-area: header;
    margin-bottom: 3rem;
  }

  .header .owner {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .stats {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 2rem;
  }

  .stats .stat {
    padding: 1rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
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

  .supporters-list {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
  }

  .supporters-list .item {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .supporters-list .item:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground);
  }

  .muted {
    color: var(--color-foreground-level-6);
  }

  @media (max-width: 1024px) {
    .project-profile {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      grid-template-areas:
        'header'
        'sidebar'
        'content';
    }

    aside {
      padding: 2rem 0;
    }
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
