<script lang="ts">
  import { onMount } from 'svelte';
  import testData from '../__test__/data/test1.json';
  import Graph from 'graphology';
  import forceAtlas2 from 'graphology-layout-forceatlas2';
  import noverlap from 'graphology-layout-noverlap';
  import type Sigma from 'sigma';
  // import type { LayoutMapping } from 'graphology-layout-forceatlas2'

  let graph: Graph;
  let sigmaInstance: Sigma;
  let graphContainer: HTMLDivElement;

  const { nodes, edges } = testData;

  type LayoutMapping = { [key: string]: { x: number; y: number } };

  function setPositions(graph: Graph, positions: LayoutMapping) {
    graph.forEachNode((node) => {
      const position = positions[node];
      graph.setNodeAttribute(node, 'x', position.x);
      graph.setNodeAttribute(node, 'y', position.y);
    });
  }

  async function initializeGraph() {
    const networkStyle = window.getComputedStyle(graphContainer);
    const nodeColorSPrimary = networkStyle.getPropertyValue('--color-primary');
    const nodeColorSecondary = networkStyle.getPropertyValue('--color-foreground');
    const edgeColor = networkStyle.getPropertyValue('--color-foreground-level-3');

    // Can't be imported server side
    // const { Sigma } = await import('sigma');
    // const { NodeBorderProgram } = await import('@sigma/node-border');
    const [{ Sigma }, { NodeBorderProgram }] = await Promise.all([
      import('sigma'),
      import('@sigma/node-border'),
    ]);

    graph = new Graph();
    for (const node of nodes) {
      const isPrimary = Math.random() > 0.75;
      graph.addNode(node.key, {
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

    // forceAtlas2.assign(graph, 50);

    const fa2Positions = forceAtlas2(graph, {
      iterations: 50,
      // https://github.com/graphology/graphology/tree/master/src/layout-forceatlas2
      settings: {
        // spread nodes apart
        gravity: 100,
        // take into account the size of the node when calculating
        // layout.the
        adjustSizes: true,
        strongGravityMode: true,
        // barnesHutOptimize: true
        // linLogMode: true,
        // outboundAttractionDistribution:
        // scalingRatio: 100
      },
    });
    // console.log(positions)

    setPositions(graph, fa2Positions);

    const noPositions = noverlap(graph, {
      maxIterations: 50,
      settings: {
        ratio: 2,
      },
    });

    setPositions(graph, noPositions);

    sigmaInstance = new Sigma(graph, graphContainer, {
      defaultNodeType: 'bordered',
      // don't adjust the size of the nodes and edges
      // when zooming.
      // https://www.sigmajs.org/storybook/?path=/story/fit-sizes-to-positions--story
      zoomToSizeRatioFunction: () => 1,
      nodeProgramClasses: {
        bordered: NodeBorderProgram,
      },
    });
    sigmaInstance.scheduleRefresh();

    // sigmaInstance.
    // TODO:
    // Too many webgl contexts
    // - We'll render images for the ecosystems grid
    // Zoom to reasonable size
    // -
  }

  onMount(initializeGraph);
</script>

<div class="ecosystem-graph" bind:this={graphContainer}></div>

<style>
  .ecosystem-graph {
    height: 100%;
  }
</style>
