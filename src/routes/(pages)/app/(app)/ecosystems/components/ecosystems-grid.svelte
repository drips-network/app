<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import EcosystemCard from './ecosystem-card.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import type { LeanEcosystem } from '$lib/utils/ecosystems/schemas';
  import EcosystemIcon from '$lib/components/icons/Ecosystem.svelte';
  import type { EcosystemProfileFragment } from '../[ecosystemId]/components/__generated__/gql.generated';

  export let ecosystems: Array<[LeanEcosystem, EcosystemProfileFragment | undefined]>;
  export let big: boolean = false;
</script>

<div class="ecosystems-grid" class:ecosystems-grid--big={big}>
  {#each ecosystems.slice(-1) as ecosystem}
    <PrimaryColorThemer colorHex="#27C537">
      <EcosystemCard ecosystem={ecosystem[0]} ecosystemChainData={ecosystem[1]}>
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
</style>
