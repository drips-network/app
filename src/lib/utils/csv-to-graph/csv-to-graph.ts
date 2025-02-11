import { parseFile as parseCsv } from '$lib/utils/csv';
import type { Graph, Node as GraphNode, Edge as GraphEdge } from '../ecosystems/schemas';

type NodeLibrary = Record<string, GraphNode>;
type EdgeLibrary = Record<string, GraphEdge>;
type CsvLayout = {
  source: number;
  target: number;
  weight?: number;
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

export function assignRandomRealisticWeights(graph: Graph) {
  const total = 100;
  for (const node of graph.nodes) {
    const edges = graph.edges.filter((e) => e.source === node.projectName);
    const degree = edges.length;
    const rands = Array.from({ length: degree }, () => Math.random());
    const randsSum = rands.reduce((sum, rand) => sum + rand, 0);

    const forMaintainers = total - Math.random() * total;
    const forDependencies = total - forMaintainers;

    for (const [index, rand] of rands.entries()) {
      rands[index] = forDependencies * (rand / randsSum);
      edges[index].weight = rands[index];
    }
  }
}

function addRootEdges(graph: Graph, edgeLibrary: EdgeLibrary) {
  const rootNodes = [];
  for (const node of graph.nodes) {
    const edge = graph.edges.find((e) => e.target === node.projectName);
    if (!edge) {
      rootNodes.push(node);
    }
  }

  for (const node of rootNodes) {
    createEdge('root', node.projectName, 0, graph, edgeLibrary);
  }
}

//

// TODO:
// - add root node
// - add edges from root node
export async function csvToGraph(
  file: File,
  layout: CsvLayout = { source: 1, target: 5 },
): Promise<Graph> {
  const rootNode = { projectName: 'root' };
  const graph: Graph = { nodes: [rootNode], edges: [] };
  const nodeLibrary: NodeLibrary = { root: rootNode };
  const edgeLibrary: EdgeLibrary = {};

  const parsedFile = await parseCsv(file);
  for (const line of parsedFile) {
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

  addRootEdges(graph, edgeLibrary);

  return graph;
}
