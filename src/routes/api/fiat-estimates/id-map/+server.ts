import { z } from 'zod';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { RequestHandler } from './$types';
import { redis } from '../../redis';
import cached from '$lib/utils/cache/remote/cached';
import { ensureResponseOk } from '$lib/utils/fetch';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';

const COINMARKETCAP_API_KEY = getOptionalEnvVar(
  'COINMARKETCAP_API_KEY',
  true,
  'Fiat estimates for supported tokens will not work.',
);

const cmcResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      symbol: z.string(),
      name: z.string(),
      platform: z
        .object({
          id: z.number(),
          token_address: z.string().nullable(),
          slug: z.string().nullable(),
        })
        .nullable(),
    }),
  ),
});

// TODO: Find some way to not fetch and send back the entire list of all tokens on CoinMarketCap,
// but only the ones currently needed for estimates.

/**
 * For alt L1/L2 tokens that don't have an equivalent value token on Eth Mainnet.
 * Keys are token contract addresses on the L1/L2, values are coinmarket cap unique asset IDs to map to.
 * */
const MANUAL_IDS: Record<string, string> = {
  /* Map Wrapped Filecoin to Filecoin */
  '0x60E1773636CF5E4A227d9AC24F20fEca034ee25A': '2280',
  /* Map METIS to METIS */
  '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000': '9640',
  /* Add RAD ID manually because for whatever reason it's missing from CMC response */
  '0x31c8eacbffdd875c74b94b077895bd78cf1e64a3': '6843',
  /* Map Optimism USDC to USDC */
  '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85': '3408',
};

export const GET: RequestHandler = async ({ fetch }) => {
  if (!COINMARKETCAP_API_KEY) {
    return new Response('{}');
  }

  const cmcIdMapRes = await cached(redis, 'cmc-id-map', 24 * 60 * 60, async () => {
    const idMapRes = await ensureResponseOk(
      fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?CMC_PRO_API_KEY=${COINMARKETCAP_API_KEY}`,
      ),
    );

    return cmcResponseSchema.parse(await idMapRes.json());
  });

  const idMap = Object.fromEntries(
    mapFilterUndefined(cmcIdMapRes.data, (tokenData) => {
      if (!tokenData.platform || !tokenData.platform?.token_address) {
        return undefined;
      }

      return [tokenData.platform.token_address.replaceAll(' ', '').toLowerCase(), tokenData.id];
    }),
  );

  for (const [address, id] of Object.entries(MANUAL_IDS)) {
    idMap[address.toLowerCase()] = Number(id);
  }

  return new Response(JSON.stringify(idMap), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=43200',
    },
  });
};
