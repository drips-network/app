<script lang="ts">
  import { onMount } from 'svelte';
  import testData from '../__test__/data/test1.json';
  import Graph from 'graphology';
  import forceAtlas2 from 'graphology-layout-forceatlas2';
  import noverlap from 'graphology-layout-noverlap';
  import type Sigma from 'sigma';
  import type { DisplayData, EdgeDisplayData, NodeDisplayData } from 'sigma/types';
  // import type { LayoutMapping } from 'graphology-layout-forceatlas2'

  export let zoom: number = 3;

  let graph: Graph;
  let sigmaInstance: Sigma;
  let graphContainer: HTMLDivElement;

  const { nodes, edges } = testData;

  type LayoutMapping = { [key: string]: { x: number; y: number } };
  type Attributes = { [name: string]: unknown };

  interface State {
    hoveredNode?: string;
    searchQuery: string;

    // State derived from query:
    selectedNode?: string;
    suggestions?: Set<string>;

    // State derived from hovered node:
    hoveredNeighbors?: Set<string>;
  }
  const state: State = { searchQuery: '' };

  function setPositions(graph: Graph, positions: LayoutMapping) {
    graph.forEachNode((node) => {
      const position = positions[node];
      graph.setNodeAttribute(node, 'x', position.x);
      graph.setNodeAttribute(node, 'y', position.y);
    });
  }

  function setZoom(sigmaInstance: Sigma, zoom: number) {
    const camera = sigmaInstance.getCamera();
    const state = camera.getState();
    camera.setState({ ...state, ratio: 1 / zoom });
  }

  // TODO: sync with wheel zoom state
  $: zoom, sigmaInstance && setZoom(sigmaInstance, zoom);

  function setHoveredNode(node?: string) {
    if (node) {
      state.hoveredNode = node;
      state.hoveredNeighbors = new Set(graph.neighbors(node));
    }

    if (!node) {
      state.hoveredNode = undefined;
      state.hoveredNeighbors = undefined;
    }

    // Refresh rendering
    sigmaInstance.refresh({
      // We don't touch the graph data so we can skip its reindexation
      skipIndexation: true,
    });
  }

  // Render nodes accordingly to the internal state:
  // 1. If a node is selected, it is highlighted
  // 2. If there is query, all non-matching nodes are greyed
  // 3. If there is a hovered node, all non-neighbor nodes are greyed
  function nodeReducer(node: string, data: Attributes): Partial<DisplayData> {
    const res: Partial<NodeDisplayData> = { ...data };

    if (state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
      res.label = '';
      res.color = '#f6f6f6';
    }

    if (state.selectedNode === node) {
      res.highlighted = true;
    } else if (state.suggestions) {
      if (state.suggestions.has(node)) {
        res.forceLabel = true;
      } else {
        res.label = '';
        res.color = '#f6f6f6';
      }
    }

    return res;
  }

  // Render edges accordingly to the internal state:
  // 1. If a node is hovered, the edge is hidden if it is not connected to the
  //    node
  // 2. If there is a query, the edge is only visible if it connects two
  //    suggestions
  function edgeReducer(edge: string, data: Attributes): Partial<DisplayData> {
    const res: Partial<EdgeDisplayData> = { ...data };

    if (
      state.hoveredNode &&
      !graph
        .extremities(edge)
        .every((n) => n === state.hoveredNode || graph.areNeighbors(n, state.hoveredNode))
    ) {
      res.hidden = true;
    }

    if (
      state.suggestions &&
      (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))
    ) {
      res.hidden = true;
    }

    return res;
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
        gravity: 1,
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

    setZoom(sigmaInstance, zoom);

    // Bind graph interactions:
    sigmaInstance.on('enterNode', ({ node }) => {
      setHoveredNode(node);
    });
    sigmaInstance.on('leaveNode', () => {
      setHoveredNode(undefined);
    });

    sigmaInstance.setSetting('nodeReducer', nodeReducer);
    sigmaInstance.setSetting('edgeReducer', edgeReducer);
  }

  onMount(initializeGraph);
</script>

<div class="ecosystem-graph" bind:this={graphContainer}></div>

<style>
  .ecosystem-graph {
    height: 100%;
  }
</style>
