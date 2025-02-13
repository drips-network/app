import type { Edge, Graph } from '$lib/utils/ecosystems/schemas';
import { csvToGraph, correctGraph } from '../csv-to-graph';
import osoUnweighted from './data/oso-unweighted-graph.csv?raw';
import osoGraphErrors from './data/oso-unweighted-graph-errors.json';
import { osoToGraphJson } from '../oso-to-graph';

describe('csv-to-graph', () => {
  let osoUnweightedFile: File;
  let graph: Graph;

  beforeAll(async () => {
    osoUnweightedFile = new File([new Blob([osoUnweighted], { type: 'text/csv' })], 'name');
    graph = await csvToGraph(osoUnweightedFile);
    await osoToGraphJson();
  });

  it('should successfully parse a csv', async () => {
    // NOTE: relies on the order of the test csv file.
    const node = graph.nodes.find((n) => n.projectName === 'eth-infinitism/account-abstraction');
    const edge = graph.edges.find((e) => e.target === 'eslint/eslintrc');
    expect(node).toBeDefined();
    expect(edge).toBeDefined();
    expect(edge?.source).toEqual('eth-infinitism/account-abstraction');
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
      const sum = edges.reduce((sum: number, e: Edge) => sum + Number(e.weight), 0);
      expect(sum).toBeLessThan(100);
    }
  });

  it('should produce a graph with a root node', () => {
    const root = graph.nodes.find((n) => n.projectName === 'root');
    expect(root).toBeDefined();
  });

  it('should produce a graph with a edges whose source is the root node', () => {
    // TODO: check all root nodes
    const edge = graph.edges.find((n) => n.source === 'root');
    expect(edge).toBeDefined();
  });

  describe('when provided an alternative layout', () => {
    beforeAll(async () => {
      graph = await csvToGraph(osoUnweightedFile, { source: 3, target: 4, startIndex: 1 });
    });

    it('should successfully parse a csv', () => {
      // NOTE: relies on the order of the test csv file.
      const headerNode = graph.nodes.find((n) => n.projectName === 'package_name');
      expect(headerNode).not.toBeDefined();

      const node = graph.nodes.find((n) => n.projectName === '@eslint/eslintrc');
      const edge = graph.edges.find((e) => e.target === 'eslint');
      expect(node).toBeDefined();
      expect(edge).toBeDefined();
      expect(edge?.source).toEqual('@eslint/eslintrc');
    });
  });

  describe('correctGraph', () => {
    beforeAll(async () => {
      graph = await csvToGraph(osoUnweightedFile, { source: 1, target: 5, startIndex: 1 });
      correctGraph(graph, osoGraphErrors);
    });

    it('should remove nodes and associated edges that are not found', () => {
      // @fastify/encoding-negotiator not found.
      const projectName = '@fastify/encoding-negotiator';
      const removal = graph.nodes.find((n) => n.projectName === projectName);
      expect(removal).not.toBeDefined();

      const edges = graph.edges.filter((e) => e.target === projectName || e.source === projectName);
      expect(edges.length).toBe(0);
    });

    it('should rename nodes and associated edges that have been renamed', () => {
      // 131/browserify-reload was renamed to repository-vault/browserify-reload
      const current = '131/browserify-reload';
      const neu = 'repository-vault/browserify-reload';

      const currentNode = graph.nodes.find((n) => n.projectName === current);
      expect(currentNode).not.toBeDefined();
      const neuNode = graph.nodes.find((n) => n.projectName === neu);
      expect(neuNode).toBeDefined();

      const currentEdges = graph.edges.filter((e) => e.target === current || e.source === current);
      expect(currentEdges.length).toBe(0);
      const neuEdges = graph.edges.filter((e) => e.target === neu || e.source === neu);
      expect(neuEdges.length).toBeGreaterThan(0);
    });
  });
});
