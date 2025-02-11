import { assignRandomRealisticWeights, csvToGraph } from './csv-to-graph';
import osoUnweighted from './data/oso-unweighted-graph.csv?raw';
import fs from 'fs';
export async function osoToGraphJson(path: string = 'oso-unweighted-graph-fake-weighted.json') {
  const osoUnweightedFile = new File([new Blob([osoUnweighted], { type: 'text/csv' })], 'name');
  const graph = await csvToGraph(osoUnweightedFile);

  assignRandomRealisticWeights(graph);
  // @ts-expect-error: githubUrl might be undefined
  graph.nodes.sort((a, b) => a.githubUrl.localeCompare(b.githubUrl));
  // @ts-expect-error: source might be undefined
  graph.edges.sort((a, b) => a.source.localeCompare(b.source));

  fs.writeFileSync(path, JSON.stringify(graph, null, 4));
}
