import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { z } from 'zod';
import type { TLVSourceFn } from '../types';

const FILECOIN_BLOCKSCOUT_API_KEY = getOptionalEnvVar(
  'FILECOIN_BLOCKSCOUT_API_KEY',
  true,
  "Filecoin TLV won't be considered for default explore page.",
);

const OPTIMISM_BLOCKSCOUT_API_KEY = getOptionalEnvVar(
  'OPTIMISM_BLOCKSCOUT_API_KEY',
  true,
  "Optimism TLV won't be considered for default explore page.",
);

const blockscoutTokensResponseSchema = z.array(
  z.object({
    token: z.object({ address: z.string(), decimals: z.string() }),
    value: z.string(),
  }),
);

const apiKeys = {
  optimism: OPTIMISM_BLOCKSCOUT_API_KEY,
  filecoin: FILECOIN_BLOCKSCOUT_API_KEY,
  metis: null,
};

const blockscoutInstanceUrls = {
  optimism: 'https://optimism.blockscout.com',
  filecoin: 'https://filecoin.blockscout.com',
  metis: 'https://andromeda-explorer.metis.io',
};

async function fetchForNetwork(network: 'optimism' | 'filecoin' | 'metis', f: typeof fetch) {
  const apiKey = apiKeys[network];

  // undefined means env var is missing, null means it's not required, so we should continue
  if (apiKey === undefined) return [];

  const dripsTokenHoldingRes = await f(
    `${blockscoutInstanceUrls[network]}/api/v2/addresses/0xd320F59F109c618b19707ea5C5F068020eA333B3/token-balances?apikey=${apiKey ?? ''}`,
  );

  if (!dripsTokenHoldingRes.ok) {
    const errorContent = await dripsTokenHoldingRes.text();
    const message = `Filecoin Blockscout returned error response: ${errorContent}`;

    throw new Error(message);
  }

  const dripsTokenHoldingsJson = await dripsTokenHoldingRes.json();

  const dripsTokenHoldings = blockscoutTokensResponseSchema
    .parse(dripsTokenHoldingsJson)
    .map((v) => ({
      tokenAddress: v.token.address,
      amount: BigInt(v.value),
      decimals: Number(v.token.decimals),
    }));

  return dripsTokenHoldings;
}

// This can be extended for other blockscout instances
const getBlockscoutChainsTlv: TLVSourceFn = async (f) => {
  if (!FILECOIN_BLOCKSCOUT_API_KEY) return [];

  const tokenHoldings = await Promise.all([
    fetchForNetwork('filecoin', f),
    fetchForNetwork('optimism', f),
    fetchForNetwork('metis', f),
  ]);

  return tokenHoldings.flat(1);
};

export default getBlockscoutChainsTlv;
