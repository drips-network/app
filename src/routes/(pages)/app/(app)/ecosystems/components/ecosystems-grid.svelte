<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import EcosystemCard from './ecosystem-card.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import type { EcosystemsListItem } from '$lib/utils/ecosystems/schemas';
  import EcosystemIcon from '$lib/components/icons/Ecosystem.svelte';
  import type { EcosystemCardFragment } from './__generated__/gql.generated';

  interface Props {
    ecosystems: Array<[EcosystemsListItem, EcosystemCardFragment | undefined]>;
    big?: boolean;
  }

  let { ecosystems, big = false }: Props = $props();

  const annotation =
    'We’re launching ecosystems with funding from Vitalik, targeting the entire Ethereum community.';
</script>

<div class="ecosystems-grid" class:ecosystems-grid--big={big}>
  {#each ecosystems as ecosystem}
    <PrimaryColorThemer colorHex={ecosystem[0].color}>
      <EcosystemCard ecosystem={ecosystem[0]} ecosystemChainData={ecosystem[1]}>
        {#snippet banner()}
          <AnnotationBox type="info" overlay size="small">
            {annotation}
            {#snippet actions()}
              <Button variant="primary" icon={EcosystemIcon}>View ecosystem</Button>
            {/snippet}
          </AnnotationBox>
        {/snippet}
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
