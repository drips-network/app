import { parseFile as parseCsv } from '$lib/utils/csv';
import type { Graph, Node as GraphNode, Edge as GraphEdge } from '../ecosystems/schemas';

type NodeLibrary = Record<string, GraphNode>;
type EdgeLibrary = Record<string, GraphEdge>;
type CsvLayout = {
  source: number;
  target: number;
  weight?: number;
  startIndex: number;
};

function createEdge(
  source: string,
  target: string,
  weight: number,
  graph: Graph,
  edgeLibrary: EdgeLibrary,
): GraphEdge | null {
  // don't add edge to same node
  if (target === source) {
    return null;
  }

  const key = `${source}${target}`;

  // only permit edges in one direction
  const dupKey = `${target}${source}`;
  const dupEdge = edgeLibrary[dupKey];
  if (dupEdge) {
    return dupEdge;
  }

  let edge = edgeLibrary[key];
  if (!edge) {
    edge = { source, target, weight };
    edgeLibrary[key] = edge;
    graph.edges.push(edge);
  }

  return edge;
}

function createNode(projectName: string, graph: Graph, nodeLibrary: NodeLibrary): GraphNode {
  let node = nodeLibrary[projectName];
  if (!node) {
    node = { projectName };
    nodeLibrary[projectName] = node;
    graph.nodes.push(node);
  }

  return node;
}

function addRootEdges(rootNode: GraphNode, graph: Graph, edgeLibrary: EdgeLibrary) {
  const rootNodes = [];
  for (const node of graph.nodes) {
    const edge = graph.edges.find((e) => e.target === node.projectName);
    if (!edge) {
      rootNodes.push(node);
    }
  }

  for (const node of rootNodes) {
    createEdge(rootNode.projectName, node.projectName, 0, graph, edgeLibrary);
  }
}

// NOTE: only guarantees AT MOST targetOrder nodes
export function reduceGraph(graph: Graph, targetOrder: number) {
  let i = graph.nodes.length - targetOrder;
  while (i > 0) {
    const randomIndex = Math.floor(Math.random() * graph.nodes.length);
    removeNode(graph, graph.nodes[randomIndex].projectName);
    i = graph.nodes.length - targetOrder;
  }
}

export function removeNode(graph: Graph, projectName: string) {
  // can't remove the root node
  if (projectName === 'root') {
    return;
  }

  // remove the node with the given projectName
  const nodeIndex = graph.nodes.findIndex((n) => n.projectName === projectName);
  if (nodeIndex === -1) {
    return;
  }
  graph.nodes.splice(nodeIndex, 1);

  // reduce all edges to those that don't include the removed projectName
  // save edges that can create orphans
  const edgesPotentialOrphans = graph.edges.filter((e) => e.source === projectName);
  const edgesWithoutProjectname = graph.edges.filter(
    (e) => e.target !== projectName && e.source !== projectName,
  );
  graph.edges = edgesWithoutProjectname;

  // look for orphaned nodes and remove them
  for (const edge of edgesPotentialOrphans) {
    const otherEdge = graph.edges.find(
      (e) => (edge !== e && e.source === edge.target) || e.target === edge.target,
    );
    // if there isn't at least one edge involved with the potential
    // orphan target node, then remove the node
    if (!otherEdge) {
      const nodeIndex = graph.nodes.findIndex((n) => n.projectName === edge.target);
      graph.nodes.splice(nodeIndex, 1);
    }
  }
}

const PROJECT_NAME_REGEX = /([^/\s]+\/[^/\s]+)/g;

function correctNotFound(graph: Graph, error: string) {
  const projectNames = error.match(PROJECT_NAME_REGEX);
  if (!projectNames) {
    return;
  }

  const projectName = projectNames[0];
  removeNode(graph, projectName);
}

function correctRenamed(graph: Graph, error: string) {
  const projectNames = error.match(PROJECT_NAME_REGEX);
  if (!projectNames) {
    return;
  }

  const current = projectNames[0];
  const neu = projectNames[1];
  if (!current || !neu) {
    return;
  }

  // don't rename a node that can't be found
  const currentNodeIndex = graph.nodes.findIndex((n) => n.projectName === current);
  if (currentNodeIndex === -1) {
    return;
  }

  // remove the current node if there is already one with the neu
  // project name
  const neuNode = graph.nodes.find((n) => n.projectName === neu);
  if (neuNode) {
    graph.nodes.splice(currentNodeIndex, 1);
  } else {
    const currentNode = graph.nodes[currentNodeIndex];
    currentNode.projectName = neu;
  }

  // create a list of edges that use the current project name, with directional information
  const currentEdges = graph.edges.reduce(
    (memo: [GraphEdge, keyof GraphEdge, keyof GraphEdge, number][], edge, index) => {
      if (edge.target === current) {
        memo.push([edge, 'target', 'source', index]);
      } else if (edge.source === current) {
        memo.push([edge, 'source', 'target', index]);
      }

      return memo;
    },
    [],
  );

  // go backwards so we can splice within the loop without
  // affecting further iterations
  let i = currentEdges.length;
  while (i--) {
    const [edge, direction, opposite, index] = currentEdges[i];
    // if there's already an edge with the neu project name in a matching
    // direction (source, target), just remove the edge we would have renamed.
    // otherwise, rename the edge's direction
    const neuEdge = graph.edges.find((e) => e[direction] === neu && e[opposite] === edge[opposite]);
    if (neuEdge) {
      graph.edges.splice(index, 1);
    } else {
      edge[direction] = neu;
    }

    // if we made a loop, remove it
    if (edge[direction] === edge[opposite]) {
      graph.edges.splice(index, 1);
    }
  }
}

export function correctGraph(graph: Graph, errors: string[]): Graph {
  for (const error of errors) {
    if (error.includes('not found')) {
      correctNotFound(graph, error);
    }

    if (error.includes('was renamed')) {
      correctRenamed(graph, error);
    }
  }

  return graph;
}

export function assignRandomRealisticWeights(graph: Graph) {
  const total = 100;
  for (const node of graph.nodes) {
    const edges = graph.edges.filter((e) => e.source === node.projectName);
    const degree = edges.length;
    const rands = Array.from({ length: degree }, () => Math.random());
    const randsSum = rands.reduce((sum, rand) => sum + rand, 0);

    let forMaintainers = total - Math.random() * total;
    // root edges must add up to 100
    if (node.projectName === 'root') {
      forMaintainers = 0;
    }
    const forDependencies = total - forMaintainers;

    for (const [index, rand] of rands.entries()) {
      rands[index] = forDependencies * (rand / randsSum);
      edges[index].weight = rands[index];
    }

    // correct last root edge so that all of them add to 100
    if (node.projectName === 'root') {
      const lastEdge = edges.at(-1);
      if (!lastEdge) {
        continue;
      }

      lastEdge.weight = total - edges.slice(0, -1).reduce((sum, e) => sum + Number(e.weight), 0);
    }
  }
}

export async function csvToGraph(
  file: File,
  layout: CsvLayout = { source: 1, target: 5, startIndex: 0 },
): Promise<Graph> {
  const rootNode = { projectName: 'root' };
  const graph: Graph = { nodes: [rootNode], edges: [] };
  const nodeLibrary: NodeLibrary = { [rootNode.projectName]: rootNode };
  const edgeLibrary: EdgeLibrary = {};

  const parsedFile = await parseCsv(file);
  for (const line of parsedFile.slice(layout.startIndex)) {
    const source = line[layout.source];
    const target = line[layout.target];

    if (!source || !target) {
      continue;
    }

    const weight = layout.weight === undefined ? 0 : Number(line[layout.weight]);

    createNode(source, graph, nodeLibrary);
    createNode(target, graph, nodeLibrary);
    createEdge(source, target, weight, graph, edgeLibrary);
  }

  addRootEdges(rootNode, graph, edgeLibrary);

  return graph;
}
