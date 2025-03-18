<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Graph from 'graphology';
  import forceAtlas2 from 'graphology-layout-forceatlas2';
  import noverlap from 'graphology-layout-noverlap';
  import type Sigma from 'sigma';
  import type { DisplayData, EdgeDisplayData, NodeDisplayData } from 'sigma/types';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import type { Attributes } from 'graphology-types';
  import {
    createDrawStraightEdgeLabel,
    type LayoutMapping,
    type NodeSelectionChangedPayload,
  } from './ecosystem-graph';
  import { createEventDispatcher } from 'svelte';
  import { fitViewportToNodes } from '@sigma/utils';
  import _ from 'lodash';
  import formatPercent from '$lib/utils/format-percent';

  const dispatch = createEventDispatcher<{
    nodeSelectionChanged: NodeSelectionChangedPayload;
  }>();

  const ROOT_NODE_ID = 'N/A';

  export let ecosystem: Ecosystem;
  export let zoom: number = 1;

  let graph: Graph;
  let sigmaInstance: Sigma;
  let graphContainer: HTMLDivElement;

  let programaticZoom: boolean = false;
  let cameraUpdated: boolean = false;

  let networkStyle: CSSStyleDeclaration;
  let colorPrimary: string;
  let colorForeground: string;
  let colorBackground: string;
  let colorForegroundLevel3: string;
  let colorForegroundLevel2: string;

  let w: number = 0;
  let h: number = 0;
  let lastW: number = w;
  let lastH: number = h;

  // for expanding and collapsing, refresh instance to get most up to date view
  $: w, h, cuttilyDetectCollapseAndDeselectNode(), refreshGraphDebounced();

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

    hoveredEdge?: string;
    hoveredEdgeExtremities?: Set<string>;
  }
  const state: State = { searchQuery: '' };

  // TODO: be less cutty
  function cuttilyDetectCollapseAndDeselectNode() {
    if (w !== lastW || h !== lastH) {
      if (w < lastW || h < lastH) {
        setSelectedNode(undefined);
      }

      lastW = w;
      lastH = h;
    }
  }

  function refreshGraph() {
    if (sigmaInstance) {
      // We don't touch the graph data so we can skip its reindexation
      sigmaInstance.refresh({ schedule: true, skipIndexation: true });
    }
  }

  const refreshGraphDebounced = _.debounce(refreshGraph);

  function setPositions(graph: Graph, positions: LayoutMapping) {
    graph.forEachNode((node) => {
      const position = positions[node];
      graph.setNodeAttribute(node, 'x', position.x);
      graph.setNodeAttribute(node, 'y', position.y);
    });
  }

  async function setZoom(sigmaInstance: Sigma, newZoom: number) {
    const min = sigmaInstance.getSetting('minCameraRatio');
    const max = sigmaInstance.getSetting('maxCameraRatio');

    if (max && newZoom > max) {
      zoom = max;
      return;
    }

    if (min && newZoom < min) {
      zoom = min;
      return;
    }

    programaticZoom = true;
    const camera = sigmaInstance.getCamera();
    const state = camera.getState();
    const newState = { ...state, ratio: 1 / newZoom };
    // animate only when using the zoom buttons
    if (cameraUpdated) {
      camera.setState(newState);
    } else {
      await camera.animate(newState);
    }
    programaticZoom = false;
  }

  $: zoom, sigmaInstance && setZoom(sigmaInstance, zoom);

  function setSelectedNode(node?: string) {
    if (node && state.selectedNode !== node) {
      // bring all the node's edges to the front
      // to draw over other edges
      const edges = graph.edges(node);
      for (const edge of edges) {
        bringEdgeToFront(graph, edge);
      }

      state.selectedNode = node;
      state.selectedNeighbors = new Set(graph.neighbors(node));
    } else {
      state.selectedNode = undefined;
      state.selectedNeighbors = undefined;
    }

    dispatch('nodeSelectionChanged', { nodeId: state.selectedNode });

    refreshGraph();
  }

  function setHoveredNode(node?: string) {
    if (node) {
      state.hoveredNode = node;
      state.hoveredNeighbors = new Set(graph.neighbors(node));
    } else {
      state.hoveredNode = undefined;
      state.hoveredNeighbors = undefined;
    }

    refreshGraph();
  }

  function setHoveredEdge(edge?: string) {
    if (edge) {
      state.hoveredEdge = edge;
      state.hoveredEdgeExtremities = new Set(graph.extremities(edge));
    } else {
      state.hoveredEdge = undefined;
      state.hoveredEdgeExtremities = undefined;
    }

    refreshGraph();
  }

  function setSelectedEdge(edge: string) {
    const extremities = graph.extremities(edge);
    // select the node in the direction of the arrow
    setSelectedNode(extremities[1]);
  }

  // Render nodes accordingly to the internal state:
  // 1. If a node is selected, it is highlighted
  // 2. If there is query, all non-matching nodes are greyed
  // 3. If there is a hovered node, all non-neighbor nodes are greyed
  function nodeReducer(node: string, data: Attributes): Partial<DisplayData> {
    const res: Partial<NodeDisplayData> = { ...data };

    if (state.selectedNeighbors) {
      if (state.selectedNeighbors.has(node) || state.selectedNode === node) {
        res.color = colorPrimary;
        res.zIndex = 2;
      } else {
        res.color = colorForegroundLevel2;
      }
    }

    if (state.hoveredNode === node || state.hoveredEdgeExtremities?.has(node)) {
      // @ts-expect-error: might be undefined
      res.label = res.projectName;
      res.highlighted = true;
    }

    if (
      state.hoveredNode === node ||
      state.selectedNode === node ||
      state.hoveredEdgeExtremities?.has(node)
    ) {
      // TODO: adjust border according to zoom?
      // const camera = sigmaInstance.getCamera()
      // const cameraState = camera.getState()
      // @ts-expect-error: borderSize doesn't exist
      res.borderSize = 5;
      res.color = colorPrimary;
      // TODO: tweak
      // @ts-expect-error: might be undefined
      res.size = res.size + 5;
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

    switch (true) {
      // highlight and label edge if it's the hovered one
      case state.hoveredEdge && state.hoveredEdge === edge:
        res.color = colorPrimary;
        res.forceLabel = true;
        break;
      // show edge labels around selected node
      case state.selectedNode && graph.extremities(edge).includes(state.selectedNode):
        res.color = colorPrimary;
        res.forceLabel = true;
        break;
      default:
        // otherwise, don't show a label
        res.label = '';
    }

    // TODO: not yet specified
    if (
      state.suggestions &&
      (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))
    ) {
      res.hidden = true;
    }

    return res;
  }

  async function handleCameraUpdated({ ratio }: { ratio: number }) {
    cameraUpdated = true;

    if (!programaticZoom) {
      zoom = 1 / ratio;
    }

    await tick();
    cameraUpdated = false;
  }

  function bringEdgeToFront(graph: Graph, edge: unknown) {
    let attribs = graph.getEdgeAttributes(edge);
    let source = graph.source(edge);
    let target = graph.target(edge);
    graph.dropEdge(edge);
    graph.addEdgeWithKey(edge, source, target, attribs);
  }

  const MIN_CAMERA_RATIO = 0.25;
  async function initializeGraphViewport() {
    requestAnimationFrame(async () => {
      await fitViewportToNodes(sigmaInstance, graph.nodes(), { animate: true });
      const camera = sigmaInstance.getCamera();
      const state = camera.getState();
      sigmaInstance.setSetting('minCameraRatio', MIN_CAMERA_RATIO);
      sigmaInstance.setSetting('maxCameraRatio', state.ratio);
    });
  }

  async function initializeGraph() {
    networkStyle = window.getComputedStyle(graphContainer);
    colorPrimary = networkStyle.getPropertyValue('--color-primary');
    colorForeground = networkStyle.getPropertyValue('--color-foreground');
    colorBackground = networkStyle.getPropertyValue('--color-background');
    colorForegroundLevel3 = networkStyle.getPropertyValue('--color-foreground-level-3');
    colorForegroundLevel2 = networkStyle.getPropertyValue('--color-foreground-level-2');

    // Can't be imported server side
    const [
      { Sigma },
      { createNodeBorderProgram },
      { drawDiscNodeHover },
      { createEdgeArrowProgram },
    ] = await Promise.all([
      import('sigma'),
      import('@sigma/node-border'),
      import('./ecosystem-graph'),
      import('sigma/rendering'),
    ]);

    graph = new Graph({ type: 'directed' });
    // TODO: bad, big error energy?
    if (!ecosystem.graph) {
      return;
    }

    for (const node of ecosystem.graph.nodes) {
      // don't add root node
      if (node.projectAccountId === ROOT_NODE_ID) {
        continue;
      }

      const isPrimary = ecosystem.graph.edges.find(
        (e) => e.source === ROOT_NODE_ID && e.target === node.projectAccountId,
      );
      const firstParentEdge = ecosystem.graph.edges.find((e) => {
        return e.source !== ROOT_NODE_ID && e.target === node.projectAccountId;
      });
      const firstParent = firstParentEdge ? firstParentEdge.source : node.projectAccountId;
      graph.addNode(node.projectAccountId, {
        color: isPrimary ? colorPrimary : colorForeground,
        labelBackgroundColor: colorBackground,
        x: Math.random(),
        y: Math.random(),
        size: isPrimary ? 16 : 8,
        borderColor: colorForeground,
        borderSize: isPrimary ? 2 : 0,
        firstParent,
        projectName: `${node.repoOwner}/${node.repoName}`,
        isPrimary,
      });
    }

    for (const edge of ecosystem.graph.edges) {
      // edge from root
      if (edge.source === ROOT_NODE_ID) {
        continue;
      }

      graph.addEdge(edge.source, edge.target, {
        color: colorForegroundLevel3,
        size: 2,
        labelBackgroundColor: colorPrimary,
        label: formatPercent(Number(edge.weight)),
        // minArrowSize: 5,
        type: 'arrowed',
      });
    }

    // const cpPositions = circlepack(graph, {
    //   hierarchyAttributes: ['firstParent'],
    //   scale: 2,
    //   // center: 0
    // });

    // setPositions(graph, cpPositions);

    // forceAtlas2.assign(graph, 50);

    const fa2Positions = forceAtlas2(graph, {
      iterations: 50,
      // https://github.com/graphology/graphology/tree/master/src/layout-forceatlas2
      settings: {
        adjustSizes: false,
        // barnesHutOptimize: false,
        // barnesHutTheta: 0.5,
        // edgeWeightInfluence: 1,
        // gravity: 1,
        // linLogMode: false,
        outboundAttractionDistribution: true,
        scalingRatio: 1.5,
        // slowDown: 1,
        // strongGravityMode: true,
      },
    });

    setPositions(graph, fa2Positions);

    const noPositions = noverlap(graph, {
      maxIterations: 50,
      settings: {
        // gridSize: 20,
        // margin: 5,
        // expansion: 1.1,
        // ratio: 1.0,
        // speed: 3
      },
    });

    setPositions(graph, noPositions);

    sigmaInstance = new Sigma(graph, graphContainer, {
      enableCameraRotation: false,
      zIndex: true,
      defaultNodeType: 'bordered',
      autoRescale: false,
      labelFont: 'Inter',
      labelWeight: '600',
      labelSize: 14,
      labelColor: {
        color: colorForeground,
      },
      renderEdgeLabels: true,
      enableEdgeEvents: true,
      // enableEdgeHoverEvents: false,
      edgeLabelFont: 'Inter',
      edgeLabelWeight: '600',
      edgeLabelSize: 14,
      edgeLabelColor: {
        color: colorBackground,
      },
      // Remove box shadow, get drippy with it
      // defaultDrawNodeHover: drawDiscNodeHover,
      // Don't draw a label underneath the hover label
      defaultDrawNodeLabel: () => {},
      // Don't rotate along edge path, get drippy with it
      // defaultDrawEdgeLabel: drawStraightEdgeLabel,
      // autoRescale: true,
      // don't adjust the size of the nodes and edges
      // when zooming.
      // https://www.sigmajs.org/storybook/?path=/story/fit-sizes-to-positions--story
      zoomToSizeRatioFunction: (zoom) => {
        // TODO: refine
        const threshold = (1 / zoom) * 16;
        if (threshold > 16) {
          return 1;
        }

        return zoom;
      },
      // itemSizesReference: 'positions',
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
      edgeProgramClasses: {
        arrowed: createEdgeArrowProgram({
          widenessToThicknessRatio: 3,
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
    sigmaInstance.on('enterEdge', ({ edge }) => {
      setHoveredEdge(edge);
    });
    sigmaInstance.on('leaveEdge', () => {
      setHoveredEdge(undefined);
    });
    sigmaInstance.on('clickEdge', ({ edge }) => {
      setSelectedEdge(edge);
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

    sigmaInstance.setSetting('defaultDrawNodeHover', drawDiscNodeHover);
    sigmaInstance.setSetting('defaultDrawEdgeLabel', createDrawStraightEdgeLabel(sigmaInstance));
    sigmaInstance.setSetting('nodeReducer', nodeReducer);
    sigmaInstance.setSetting('edgeReducer', edgeReducer);

    initializeGraphViewport();
  }

  onMount(initializeGraph);
</script>

<div
  class="ecosystem-graph"
  class:hovered-node={state.hoveredNode}
  class:hovered-edge={state.hoveredEdge}
  class:dragging={state.isDragging}
  bind:this={graphContainer}
  bind:clientWidth={w}
  bind:clientHeight={h}
></div>

<style>
  .ecosystem-graph {
    height: 100%;
    cursor: grab;
  }

  .ecosystem-graph.hovered-edge,
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
