/* eslint-disable no-console */

import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';
import { error } from '@sveltejs/kit';
import { JsonRpcProvider } from 'ethers';

async function checkGqlApi() {
  const testQuery = `
    query Test {
      __typename
    }
  `;

  await query(testQuery);
}

async function checkRpc() {
  const provider = new JsonRpcProvider(network.rpcUrl, network);

  await provider.getBlockNumber();
}

async function checkLp(f: typeof fetch) {
  await f('/', { signal: AbortSignal.timeout(10000) });
}

async function checkExplore(f: typeof fetch) {
  await f('/app', { signal: AbortSignal.timeout(10000) });
}

export const GET = async ({ fetch }) => {
  console.log('Health check started');

  const checks = [
    { name: 'GraphQL API', fn: checkGqlApi },
    { name: 'RPC', fn: checkRpc },
    { name: 'Landing Page', fn: () => checkLp(fetch) },
    { name: 'Explore', fn: () => checkExplore(fetch) },
  ];

  const results = await Promise.allSettled(
    checks.map(async ({ name, fn }) => {
      const start = performance.now();
      try {
        await fn();
        const duration = performance.now() - start;
        console.log(`- ${name} check completed in ${duration.toFixed(2)}ms`);
        return { name, duration };
      } catch (err) {
        const duration = performance.now() - start;
        console.error(`- ${name} check failed in ${duration.toFixed(2)}ms`, err);
        throw { name, error: err, duration };
      }
    }),
  );

  const errors = results
    .map((result) => (result.status === 'rejected' ? result.reason : null))
    .filter((error) => error !== null);

  if (errors.length > 0) {
    console.error('Health endpoint request failed. Errors:', JSON.stringify(errors));
    return error(500, JSON.stringify({ errors }));
  }

  return new Response('OK');
};
