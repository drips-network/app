<script lang="ts">
  import { onMount } from 'svelte';
  import Graph from 'graphology';
  import forceAtlas2 from 'graphology-layout-forceatlas2';
  import noverlap from 'graphology-layout-noverlap';
  import type Sigma from 'sigma';
  import type { DisplayData, EdgeDisplayData, NodeDisplayData } from 'sigma/types';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';

  // TODO:
  // add the right data to the edge label
  // click a node to laod the project data

  export let ecosystem: Ecosystem;
  export let zoom: number = 1;

  let graph: Graph;
  let sigmaInstance: Sigma;
  let graphContainer: HTMLDivElement;

  let programaticZoom: boolean = false;

  let networkStyle: CSSStyleDeclaration;
  let nodeColorPrimary: string;
  let nodeColorSecondary: string;
  let nodeColorTertiary: string;
  let edgeColor: string;

  type LayoutMapping = { [key: string]: { x: number; y: number } };
  type Attributes = { [name: string]: unknown };

  interface State {
    isDragging?: boolean;

    hoveredNode?: string;
    searchQuery: string;

    // State derived from query:
    selectedNode?: string;
    suggestions?: Set<string>;

    // State derived from hovered node:
    hoveredNeighbors?: Set<string>;
    // State derived from selected node:
    selectedNeighbors?: Set<string>;
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
    programaticZoom = true;
    const camera = sigmaInstance.getCamera();
    const state = camera.getState();
    camera.setState({ ...state, ratio: 1 / zoom });
    programaticZoom = false;
  }

  $: zoom, sigmaInstance && setZoom(sigmaInstance, zoom);

  function setSelectedNode(node?: string) {
    if (node && state.selectedNode !== node) {
      state.selectedNode = node;
      state.selectedNeighbors = new Set(graph.neighbors(node));
    } else {
      state.selectedNode = undefined;
      state.selectedNeighbors = undefined;
    }

    // Refresh rendering
    sigmaInstance.refresh({
      // We don't touch the graph data so we can skip its reindexation
      skipIndexation: true,
    });
  }

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

    if (state.selectedNeighbors) {
      if (state.selectedNeighbors.has(node) || state.selectedNode === node) {
        res.color = nodeColorPrimary;
      }
    }

    if (state.hoveredNode === node) {
      // @ts-expect-error: might be undefined
      res.label = res.projectName;
    }

    if (state.hoveredNode === node || state.selectedNode === node) {
      // @ts-expect-error: borderSize doesn't exist
      res.borderSize = 5;
      res.color = nodeColorPrimary;
      // TODO: tweak
      // @ts-expect-error: might be undefined
      res.size = res.size + 2.5;
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
  // 0. Color every neighboring edge the primary color
  // X1. If a node is hovered, the edge is hidden if it is not connected to the
  //    node
  // 2. If there is a query, the edge is only visible if it connects two
  //    suggestions
  function edgeReducer(edge: string, data: Attributes): Partial<DisplayData> {
    const res: Partial<EdgeDisplayData> = { ...data };

    if (state.selectedNode) {
      if (graph.extremities(edge).includes(state.selectedNode)) {
        // show edge labels when we have selected a node
        res.color = nodeColorPrimary;
        res.forceLabel = true;
      } else {
        res.hidden = true;
      }
    } else if (state.hoveredNode) {
      // don't show edge labels while hovering
      res.label = '';
    }

    if (
      state.suggestions &&
      (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))
    ) {
      res.hidden = true;
    }

    return res;
  }

  function handleCameraUpdated({ ratio }: { ratio: number }) {
    if (!programaticZoom) {
      zoom = 1 / ratio;
    }
  }

  async function initializeGraph() {
    networkStyle = window.getComputedStyle(graphContainer);
    nodeColorPrimary = networkStyle.getPropertyValue('--color-primary');
    nodeColorSecondary = networkStyle.getPropertyValue('--color-foreground');
    nodeColorTertiary = networkStyle.getPropertyValue('--color-background');
    edgeColor = networkStyle.getPropertyValue('--color-foreground-level-3');

    // Can't be imported server side
    const [{ Sigma }, { createNodeBorderProgram }, { drawDiscNodeHover, drawStraightEdgeLabel }] =
      await Promise.all([
        import('sigma'),
        import('@sigma/node-border'),
        import('./ecosystem-graph'),
      ]);

    graph = new Graph({ type: 'directed' });
    // TODO: bad, big error energy?
    if (!ecosystem.graph) {
      return;
    }

    for (const node of ecosystem.graph.nodes) {
      // don't add root node
      if (node.repoOwner === 'root' && node.repoName === 'root') {
        continue;
      }

      const isPrimary = ecosystem.graph.edges.find(
        (e) => e.source === null && e.target === node.projectAccountId,
      );
      graph.addNode(node.projectAccountId, {
        color: isPrimary ? nodeColorPrimary : nodeColorSecondary,
        labelBackgroundColor: nodeColorTertiary,
        // label: `${node.repoOwner}/${node.repoName}`,
        x: Math.random(),
        y: Math.random(),
        size: isPrimary ? 16 : 8,
        borderColor: nodeColorSecondary,
        borderSize: isPrimary ? 2 : 0,
        projectName: `${node.repoOwner}/${node.repoName}`,
        isPrimary,
      });
    }

    for (const edge of ecosystem.graph.edges) {
      // edge from root
      if (edge.source === null) {
        continue;
      }

      // console.log(edge)

      graph.addEdge(edge.source, edge.target, {
        color: edgeColor,
        size: 3,
        labelBackgroundColor: nodeColorPrimary,
        label: `${(Number(edge.weight) * 100).toFixed(2)}%`,
      });
    }

    // forceAtlas2.assign(graph, 50);

    const fa2Positions = forceAtlas2(graph, {
      iterations: 50,
      // https://github.com/graphology/graphology/tree/master/src/layout-forceatlas2
      settings: {
        // spread nodes apart
        // gravity: 0,
        // take into account the size of the node when calculating
        // layout.the
        // adjustSizes: true,
        // strongGravityMode: true,
        // barnesHutOptimize: true
        // linLogMode: true,
        // outboundAttractionDistribution:
        // scalingRatio: 1
      },
    });
    // // console.log(positions)

    setPositions(graph, fa2Positions);

    const noPositions = noverlap(graph, {
      maxIterations: 50,
    });

    setPositions(graph, noPositions);

    sigmaInstance = new Sigma(graph, graphContainer, {
      defaultNodeType: 'bordered',
      autoRescale: false,
      labelFont: 'Inter',
      labelWeight: '600',
      labelSize: 16,
      labelColor: {
        color: nodeColorSecondary,
      },
      renderEdgeLabels: true,
      edgeLabelFont: 'Inter',
      edgeLabelWeight: '600',
      edgeLabelSize: 16,
      edgeLabelColor: {
        color: nodeColorTertiary,
      },
      // Remove box shadow on hover
      // https://github.com/jacomyal/sigma.js/blob/f5f397854b19e95d55fd0b4b9de5cdebfaa3f159/packages/sigma/src/rendering/node-hover.ts#L23
      defaultDrawNodeHover: drawDiscNodeHover,
      // don't draw a label underneath the hover label
      defaultDrawNodeLabel: () => {},
      defaultDrawEdgeLabel: drawStraightEdgeLabel,
      // autoRescale: true,
      // don't adjust the size of the nodes and edges
      // when zooming.
      // https://www.sigmajs.org/storybook/?path=/story/fit-sizes-to-positions--story
      zoomToSizeRatioFunction: () => 1,
      nodeProgramClasses: {
        // bordered: NodeBorderProgram,
        bordered: createNodeBorderProgram({
          borders: [
            {
              size: { attribute: 'borderSize', defaultValue: 1, mode: 'pixels' },
              color: { attribute: 'borderColor' },
            },
            { size: { fill: true }, color: { attribute: 'color' } },
          ],
        }),
      },
    });

    // setZoom(sigmaInstance, 2);

    const camera = sigmaInstance.getCamera();
    camera.on('updated', handleCameraUpdated);

    // Bind graph interactions:
    sigmaInstance.on('enterNode', ({ node }) => {
      setHoveredNode(node);
    });
    sigmaInstance.on('leaveNode', () => {
      setHoveredNode(undefined);
    });
    sigmaInstance.on('clickNode', ({ node }) => {
      setSelectedNode(node);
    });
    sigmaInstance.on('clickStage', () => {
      setSelectedNode(undefined);
    });

    sigmaInstance.getMouseCaptor().on('mousedown', () => {
      state.isDragging = true;
    });
    sigmaInstance.getMouseCaptor().on('mouseup', () => {
      state.isDragging = false;
    });

    sigmaInstance.setSetting('nodeReducer', nodeReducer);
    sigmaInstance.setSetting('edgeReducer', edgeReducer);
  }

  onMount(initializeGraph);
</script>

<div
  class="ecosystem-graph"
  class:hovered-node={state.hoveredNode}
  class:dragging={state.isDragging}
  bind:this={graphContainer}
></div>

<style>
  .ecosystem-graph {
    height: 100%;
    cursor: grab;
  }

  .ecosystem-graph.hovered-node {
    cursor: pointer;
  }

  .ecosystem-graph.dragging {
    cursor: grabbing;
  }

  /* edge labels should always be on top */
  .ecosystem-graph :global(.sigma-edgeLabels) {
    z-index: 1;
  }

  /* mouse events should not be obscurred */
  .ecosystem-graph :global(.sigma-mouse) {
    z-index: 2;
  }
</style>
