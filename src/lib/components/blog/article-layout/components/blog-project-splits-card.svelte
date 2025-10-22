<script lang="ts">
  import { gql } from 'graphql-request';
  import { onMount } from 'svelte';
  import query from '$lib/graphql/dripsQL';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { fade } from 'svelte/transition';
  import network from '$lib/stores/wallet/network';
  import { SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT } from '$lib/components/splits/types';
  import ProjectBadge, {
    PROJECT_BADGE_FRAGMENT,
  } from '$lib/components/project-badge/project-badge.svelte';
  import Splits from '$lib/components/splits/splits.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import type { BlogProjectQuery, BlogProjectQueryVariables } from './__generated__/gql.generated';
  import isClaimed from '$lib/utils/project/is-claimed';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';

  export let projectId: string;

  let project: NonNullable<BlogProjectQuery['projectById']> | undefined = undefined;
  let projectChainData:
    | NonNullable<BlogProjectQuery['projectById']>['chainData'][number]
    | undefined = undefined;

  onMount(async () => {
    await fiatEstimates.start();

    const blogProjectQuery = gql`
      ${SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT}
      ${PROJECT_BADGE_FRAGMENT}
      query blogProject($projectId: ID!, $chain: SupportedChain!) {
        projectById(id: $projectId, chains: [$chain]) {
          chainData {
            ...SplitsComponentProjectSplits
          }
          ...ProjectBadge
        }
      }
    `;

    const projectRes = (
      await query<BlogProjectQuery, BlogProjectQueryVariables>(blogProjectQuery, {
        projectId,
        chain: network.gqlName,
      })
    ).projectById;

    if (projectRes) {
      project = projectRes;
      projectChainData = filterCurrentChainData(projectRes.chainData);
    }
  });
</script>

<div data-custom-blog-component>
  <div class="wrapper">
    <PaddedHorizontalScroll>
      <TransitionedHeight transitionHeightChanges>
        {#if project && projectChainData && isClaimed(projectChainData)}
          <div
            in:fade
            style:display="flex"
            style:gap="1rem"
            style:flex-direction="column"
            style:padding="1rem"
          >
            <ProjectBadge tooltip={false} {project} />
            <Splits
              groupsExpandable={false}
              startExpanded={true}
              list={[
                {
                  __typename: 'SplitGroup',
                  name: 'Maintainers',
                  list: projectChainData.splits.maintainers,
                },
                {
                  __typename: 'SplitGroup',
                  name: 'Dependencies',
                  list: projectChainData.splits.dependencies,
                },
              ]}
            />
          </div>
        {:else}
          <div class="loading"><Spinner /></div>
        {/if}
      </TransitionedHeight>
    </PaddedHorizontalScroll>
  </div>
</div>

<style>
  .wrapper {
    width: calc(100% + 4rem);
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 2rem 0 2rem 2rem;
    margin: 2.5rem -2rem;
    padding: 0.5rem;
    overflow: hidden;
  }

  .loading {
    height: 22.765rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 797px) {
    .wrapper {
      width: 100%;
      margin: 2.5rem 0;
    }
  }
</style>
