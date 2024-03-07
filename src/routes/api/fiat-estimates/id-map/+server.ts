import { COINMARKETCAP_API_KEY } from '$env/static/private';
import { z } from 'zod';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { RequestHandler } from './$types';
import { getRedis } from '../../redis';
import { env } from '$env/dynamic/private';

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

export const GET: RequestHandler = async () => {
  const redis = env.CACHE_REDIS_CONNECTION_STRING ? await getRedis() : undefined;

  const cachedResponse = redis && (await redis.get('cmc-id-map'));

  let cmcIdMapRes: z.infer<typeof cmcResponseSchema>;

  if (cachedResponse) {
    cmcIdMapRes = cmcResponseSchema.parse(JSON.parse(cachedResponse));
  } else {
    const idMapRes = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?CMC_PRO_API_KEY=${COINMARKETCAP_API_KEY}`,
    );

    cmcIdMapRes = cmcResponseSchema.parse(await idMapRes.json());

    await redis?.set('cmc-id-map', JSON.stringify(cmcIdMapRes), {
      EX: 60,
    });
  }

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
    },
  });
};
