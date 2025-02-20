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

const COINMARKETCAP_ETHEREUM_PLATFORM_ID = 1;

// TODO: Find some way to not fetch and send back the entire list of all tokens on CoinMarketCap,
// but only the ones currently needed for estimates.

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
      // Don't include if platform is not Ethereum
      if (
        !tokenData.platform ||
        tokenData.platform.id !== COINMARKETCAP_ETHEREUM_PLATFORM_ID ||
        !tokenData.platform?.token_address
      ) {
        return undefined;
      }

      return [tokenData.platform.token_address.replaceAll(' ', '').toLowerCase(), tokenData.id];
    }),
  );

  // Manually add in the RAD token since it's missing a platform value on CMC for some reason
  idMap['0x31c8eacbffdd875c74b94b077895bd78cf1e64a3'] = 6843;

  return new Response(JSON.stringify(idMap), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=43200',
    },
  });
};
