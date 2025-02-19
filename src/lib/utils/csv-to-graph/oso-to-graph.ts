import {
  addLevel,
  assignRandomRealisticWeights,
  correctGraph,
  csvToGraph,
  // findLongestPath,
  reduceGraph,
} from './csv-to-graph';
import osoUnweighted from './__test__/data/oso-unweighted-graph.csv?raw';
import fs from 'fs';
import osoGraphErrors from './__test__/data/oso-unweighted-graph-errors.json';

export async function osoToGraphJson(
  path: string = 'oso-unweighted-graph-fake-weighted.json',
  reduce: number = Infinity,
) {
  const osoUnweightedFile = new File([new Blob([osoUnweighted], { type: 'text/csv' })], 'name');
  const graph = await csvToGraph(osoUnweightedFile, { source: 1, target: 5, startIndex: 1 });

  correctGraph(graph, osoGraphErrors);
  const originalGraph = JSON.parse(JSON.stringify(graph));
  if (Number.isFinite(reduce) && reduce > 0) {
    reduceGraph(graph, reduce);
  }

  // console.log('longestPath', findLongestPath(graph));
  addLevel(graph, originalGraph);
  // console.log('longestPath', findLongestPath(graph));

  assignRandomRealisticWeights(graph);

  graph.nodes.sort((a, b) => a.projectName.localeCompare(b.projectName));
  // @ts-expect-error: source might be undefined
  graph.edges.sort((a, b) => a.source.localeCompare(b.source));

  fs.writeFileSync(path, JSON.stringify(graph, null, 4));
}
