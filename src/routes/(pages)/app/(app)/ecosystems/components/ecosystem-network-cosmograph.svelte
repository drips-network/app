<script lang="ts">
  import { onMount } from 'svelte';
  import testData from '../__test__/data/test.json';
  import { Cosmograph, type CosmographInputConfig } from '@cosmograph/cosmograph';
  import type { CosmosInputNode, CosmosInputLink } from '@cosmograph/cosmos';

  let networkContainer: HTMLDivElement;

  const { nodes, edges } = testData;

  function initializeNetwork() {
    const config: CosmographInputConfig<CosmosInputNode, CosmosInputLink> = {
      // @ts-expect-error: any
      nodeColor: (d) => d.color,
      nodeSize: 1,
      linkWidth: 2,
      backgroundColor: 'transparent',
      showDynamicLabels: false,
      randomSeed: 0,
      fitViewDelay: 0,
      // ...
    };
    const cosmograph = new Cosmograph(networkContainer, config);
    cosmograph.setData(nodes, edges);
  }

  onMount(initializeNetwork);
</script>

<div class="ecosystem-network" bind:this={networkContainer}></div>
