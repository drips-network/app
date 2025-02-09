import type { Edge, Graph } from '$lib/utils/ecosystems/schemas';
import { csvToGraph } from '../csv-to-graph';
import osoUnweighted from './data/oso-unweighted-graph.csv?raw';

describe('csv-to-graph', () => {
  let osoUnweightedFile: File;
  let graph: Graph;

  beforeAll(() => {
    osoUnweightedFile = new File([new Blob([osoUnweighted], { type: 'text/csv' })], 'name');
  });

  it('should successfully parse a csv', async () => {
    graph = await csvToGraph(osoUnweightedFile);
  });

  it('should produce a graph with non-empty nodes', () => {
    expect(graph.nodes.every((n) => !!n.projectName)).toBeTruthy();
  });

  it('should produce a graph with non-empty edges', () => {
    expect(graph.edges.every((e) => !!e.source && !!e.target)).toBeTruthy();
  });

  it('should produce a graph with no duplicate nodes', () => {
    const set = new Set(graph.nodes.map((n) => n.projectName));
    expect(graph.nodes.length).toEqual(set.size);
  });

  it('should produce a graph with no duplicate edges', () => {
    const set = new Set(graph.edges.map((e) => `${e.source}${e.target}`));
    expect(graph.edges.length).toEqual(set.size);
  });

  // prevent edges whose source and target are the same
  // ensure edges are unidreictional
  it('should produce a graph with no duplicate edges', () => {
    const sourceEdges = new Set(graph.edges.map((e) => `${e.source}${e.target}`));
    const targetEdges = new Set(graph.edges.map((e) => `${e.target}${e.source}`));
    const intersection = sourceEdges.intersection(targetEdges);
    expect(intersection.size).toEqual(0);
  });

  it('should produce a graph in which each nodes edges do not add up to 100', () => {
    for (const node of graph.nodes) {
      const edges = graph.edges.filter((e: Edge) => e.source === node.projectName);
      const sum = edges.reduce((sum: number, e: Edge) => sum + e.weight, 0);
      expect(sum).toBeLessThan(100);
    }
  });
});
