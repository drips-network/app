import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { COINMARKETCAP_API_KEY } from '$env/static/private';
import { z } from 'zod';
import { redis } from '../../../redis';

const cmcResponseSchema = z.object({
  data: z.record(
    z.string(),
    z.object({
      quote: z.object({
        USD: z.object({
          price: z.number(),
        }),
      }),
    }),
  ),
});

export const GET: RequestHandler = async ({ params }) => {
  const { token_ids } = params;

  // tokenIds is a comma-separated string of IDs, so parse it as such
  let tokenIds = token_ids.split(',');
  tokenIds = Array.from(new Set(tokenIds));

  // Ensure all the token IDs are numeric strings
  try {
    z.array(z.preprocess(Number, z.number())).parse(tokenIds);
  } catch {
    throw error(400, 'Invalid token ID submitted');
  }

  let prices: Record<string, number | undefined> = Object.fromEntries(
    tokenIds.map((tokenId) => [tokenId, undefined]),
  );

  await Promise.all(
    tokenIds.map(async (tokenId) => {
      const cachedPrice = redis && (await redis.get(`cmc-price-${tokenId}`));

      if (cachedPrice) {
        prices[tokenId] = JSON.parse(cachedPrice);
      }
    }),
  );

  const tokenIdsToFetch = tokenIds.filter((tokenId) => prices[tokenId] === undefined).join(',');

  if (tokenIdsToFetch.length > 0) {
    const priceRes = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=${COINMARKETCAP_API_KEY}&id=${tokenIdsToFetch}&convert=usd`,
    );

    const parsedRes = cmcResponseSchema.parse(await priceRes.json());

    prices = {
      ...prices,
      ...Object.fromEntries(
        Object.entries(parsedRes.data).map(([tokenId, data]) => [tokenId, data.quote.USD.price]),
      ),
    };

    await Promise.all(
      Object.entries(parsedRes.data).map(([tokenId, data]) =>
        redis?.set(`cmc-price-${tokenId}`, data.quote.USD.price, {
          EX: 180,
        }),
      ),
    );
  }

  // Return an object of tokenAddresses with their prices
  return new Response(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(prices).map(([tokenId, price]) => [tokenId, price ?? null]),
      ),
    ),
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  );
};
