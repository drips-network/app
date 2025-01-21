<script lang="ts">
  import { onMount } from 'svelte';
  import testData from '../__test__/data/test.json';
  import Graph from 'graphology';
  import forceAtlas2 from 'graphology-layout-forceatlas2';

  let graph: Graph;
  let sigmaInstance: Sigma;
  let networkContainer: HTMLDivElement;

  const { nodes, edges } = testData;

  async function initializeNetwork() {
    // Can't be imported server side
    const { Sigma } = await import('sigma');
    graph = new Graph();
    for (const node of nodes) {
      graph.addNode(node.id, { color: 'red', label: 'thing', x: Math.random(), y: Math.random() });
    }

    for (const edge of edges) {
      graph.addEdge(edge.source, edge.target);
    }

    forceAtlas2.assign(graph, 50);

    sigmaInstance = new Sigma(graph, networkContainer);
    sigmaInstance.refresh();
    // TODO:
    // Too many webgl contexts
    // Border / outline around nodes: possible with https://www.sigmajs.org/storybook/?path=/story/sigma-node-border--node-border
    // Zoom to reasonable size
  }

  onMount(initializeNetwork);
</script>

<div class="ecosystem-network" bind:this={networkContainer}></div>

<style>
  .ecosystem-network {
    height: 100%;
  }
</style>
