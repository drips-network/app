import { parseFile as parseCsv } from '$lib/utils/csv';
import type { Edge, NewGraph, NewNode } from '../ecosystems/schemas';

type NodeLibrary = Record<string, NewNode>;
type EdgeLibrary = Record<string, Edge>;
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
  graph: NewGraph,
  edgeLibrary: EdgeLibrary,
): Edge | null {
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

function createNode(projectName: string, graph: NewGraph, nodeLibrary: NodeLibrary): NewNode {
  let node = nodeLibrary[projectName];
  if (!node) {
    node = { projectName };
    nodeLibrary[projectName] = node;
    graph.nodes.push(node);
  }

  return node;
}

function addRootEdges(rootNode: NewNode, graph: NewGraph, edgeLibrary: EdgeLibrary) {
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
): Promise<NewGraph> {
  const rootNode = { projectName: 'root' };
  const graph: NewGraph = { nodes: [rootNode], edges: [] };
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
