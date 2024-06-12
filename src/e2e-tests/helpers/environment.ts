/* eslint-disable no-console */

import { SUBGRAPH_URL } from '$env/static/private';

export async function wait() {
  console.log('Waiting for Graph Node…', {
    host: process.env?.PUBLIC_TEST_SUBGRAPH_HOST ?? '127.0.0.1',
  });

  // Ping port 8000 until the graph node responds
  await new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          SUBGRAPH_URL ?? 'http://127.0.0.1:8000/subgraphs/name/drips-subgraph-local',
          {
            method: 'POST',
            body: '{ "operationName": "introspectionQuery", "query": "query { __schema }" }',
          },
        );
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

export default { wait };
