<script lang="ts">
  import { onMount } from 'svelte';
  import testData from '../__test__/data/test0.json';
  import { Cosmograph, type CosmographInputConfig } from '@cosmograph/cosmograph';
  import type { CosmosInputNode, CosmosInputLink } from '@cosmograph/cosmos';

  let graphContainer: HTMLDivElement;

  const { nodes, edges } = testData;

  function initializeGraph() {
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
    const cosmograph = new Cosmograph(graphContainer, config);
    cosmograph.setData(nodes, edges);
    // TODO:
    // Stop wiggling around?
    // Borders around nodes
  }

  onMount(initializeGraph);
</script>

<div class="ecosystem-graph" bind:this={graphContainer}></div>
