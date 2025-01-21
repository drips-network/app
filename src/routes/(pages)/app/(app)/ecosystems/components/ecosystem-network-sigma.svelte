<script lang="ts">
  import { onMount } from 'svelte';
  import testData from '../__test__/data/test.json';
  import Graph from 'graphology';
  import forceAtlas2 from 'graphology-layout-forceatlas2';
  import type Sigma from 'sigma';

  let graph: Graph;
  let sigmaInstance: Sigma;
  let networkContainer: HTMLDivElement;

  const { nodes, edges } = testData;

  async function initializeNetwork() {
    const networkStyle = window.getComputedStyle(networkContainer);
    const nodeColorSPrimary = networkStyle.getPropertyValue('--color-primary');
    const nodeColorSecondary = networkStyle.getPropertyValue('--color-foreground');
    const edgeColor = networkStyle.getPropertyValue('--color-foreground-level-3');

    // Can't be imported server side
    const { Sigma } = await import('sigma');
    const { NodeBorderProgram } = await import('@sigma/node-border');

    graph = new Graph();
    for (const node of nodes) {
      const isPrimary = Math.random() > 0.75;
      graph.addNode(node.id, {
        color: isPrimary ? nodeColorSPrimary : nodeColorSecondary,
        label: 'thing',
        x: Math.random(),
        y: Math.random(),
        size: isPrimary ? 16 : 8,
        borderColor: 'black',
      });
    }

    for (const edge of edges) {
      graph.addEdge(edge.source, edge.target, { color: edgeColor, size: 3 });
    }

    forceAtlas2.assign(graph, 50);

    sigmaInstance = new Sigma(graph, networkContainer, {
      defaultNodeType: 'bordered',
      nodeProgramClasses: {
        bordered: NodeBorderProgram,
      },
    });
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
