<script lang="ts" context="module">
  export const PROJECTS_SECTION_PROJECT_FRAGMENT = gql`
    ${PROJECT_CARD_FRAGMENT}
    fragment ProjectsSectionProject on Project {
      ...ProjectCard
    }
  `;
</script>

<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import EcosystemCard, { PROJECT_CARD_FRAGMENT } from './ecosystem-card.svelte';
  import { gql } from 'graphql-request';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import EcosystemIcon from '$lib/components/icons/Ecosystem.svelte';

  export let ecosystems: Ecosystem[];
  export let big: boolean = false;
</script>

<div class="ecosystems-grid" class:ecosystems-grid--big={big}>
  {#each ecosystems.slice(-1) as ecosystem}
    <PrimaryColorThemer colorHex="#27C537">
      <EcosystemCard {ecosystem}>
        <svelte:fragment slot="banner">
          <AnnotationBox type="info" overlay size="small">
            We're launching ecosystems with funding from Vitalik, targeting the entire Ethereum
            community.
            <svelte:fragment slot="actions">
              <Button variant="primary" icon={EcosystemIcon}>View ecosystem</Button>
            </svelte:fragment>
          </AnnotationBox>
        </svelte:fragment>
      </EcosystemCard>
    </PrimaryColorThemer>
  {/each}
</div>

<style>
  .ecosystems-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    max-width: 100%;
    position: relative;
    padding: 2px;
  }

  .ecosystems-grid.ecosystems-grid--big {
    grid-template-columns: 1fr;
  }

  /* .ecosystems-grid > * {
    flex: 1;
    min-width: 16rem;
    max-width: calc(50% - 0.75rem);
    width: calc(25% - 0.75rem);
  } */

  @media (max-width: 560px) {
    /* .ecosystems-grid > * {
      width: 100%;
      max-width: 100%;
    } */
  }
</style>
