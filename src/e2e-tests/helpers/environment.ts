/* eslint-disable no-console */
import { execa } from 'execa';

export async function start() {
  // For good measure
  await stop();

  console.log('Starting E2E env...');
  await execa('docker', ['compose', 'up', '--detach']);

  console.log('Waiting for Graph Node…');

  // Ping port 8000 until the graph node responds
  await new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        console.log('Pinging Graph Node…');

        const res = await fetch('http://127.0.0.1:8000/subgraphs/name/drips-subgraph-local', {
          method: 'POST',
          body: '{ "operationName": "introspectionQuery", "query": "query { __schema }" }',
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!res.ok || ((await res.json()) as any).errors?.length > 0) throw new Error();

        clearInterval(interval);
        resolve(undefined);
      } catch (e) {
        // Ignore
      }
    }, 1000);
  });

  console.log('Ready.');
}

export async function stop() {
  console.log('Stopping E2E env…');
  await execa('docker', ['compose', 'down']);
}

export default { start, stop };
