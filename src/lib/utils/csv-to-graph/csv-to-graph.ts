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
