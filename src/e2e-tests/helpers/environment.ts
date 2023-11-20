/* eslint-disable no-console */

export async function wait() {
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

export default { wait };
