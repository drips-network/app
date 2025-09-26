<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const RPGF_APPLICATION_SPLITS_CARD_PROJECT_FRAGMENT = gql`
    ${SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT}
    ${PROJECT_BADGE_FRAGMENT}
    fragment RpgfApplicationSplitsCardProject on Project {
      ...ProjectBadge
      chainData {
        ...SplitsComponentProjectSplits
        ... on ClaimedProjectData {
          chain
        }
        ... on UnClaimedProjectData {
          chain
        }
      }
    }
  `;
</script>

<script lang="ts">
  import Splits from '../splits/splits.svelte';
  import { SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT } from '../splits/types';
  import type { RpgfApplicationSplitsCardProjectFragment } from './__generated__/gql.generated';
  import isClaimed from '$lib/utils/project/is-claimed';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import RpgfApplicationDetailsCard from '../rpgf-application-details-card/rpgf-application-details-card.svelte';
  import PaddedHorizontalScroll from '../padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import ProjectBadge, { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';

  export let project: RpgfApplicationSplitsCardProjectFragment;
  $: currentChainData = filterCurrentChainData(project.chainData);
</script>

{#if isClaimed(currentChainData)}
  <RpgfApplicationDetailsCard key="project-splits" title="Project Splits">
    <div style:display="flex" style:flex-direction="column" style:gap="2rem">
      <p>The Drips Project linked to this application is currently splitting funds as follows.</p>
      <div style:display="flex" style:flex-direction="column" style:gap="1rem">
        <ProjectBadge {project} />
        <PaddedHorizontalScroll>
          <Splits
            disableLinks={false}
            list={[
              {
                __typename: 'SplitGroup',
                name: 'Maintainers',
                list: currentChainData.splits.maintainers,
              },
              {
                __typename: 'SplitGroup',
                name: 'Dependencies',
                list: currentChainData.splits.dependencies,
              },
            ]}
          />
        </PaddedHorizontalScroll>
      </div>
      <AnnotationBox type="info">Drips Project splits may change over time.</AnnotationBox>
    </div>
  </RpgfApplicationDetailsCard>
{/if}
