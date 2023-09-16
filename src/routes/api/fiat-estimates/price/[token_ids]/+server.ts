import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { COINMARKETCAP_API_KEY } from '$env/static/private';
import { z } from 'zod';

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
  const tokenIds = token_ids.split(',');

  // Ensure all the token IDs are numeric strings
  try {
    z.array(z.preprocess(Number, z.number())).parse(tokenIds);
  } catch {
    throw error(400, 'Invalid token ID submitted');
  }

  const priceRes = await fetch(
    `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=${COINMARKETCAP_API_KEY}&id=${token_ids}&convert=usd`,
  );

  const parsedRes = cmcResponseSchema.parse(await priceRes.json());

  // Return an object of tokenAddresses with their prices
  return new Response(
    JSON.stringify(
      Object.fromEntries(
        tokenIds.map((tokenId) => [tokenId, parsedRes.data[tokenId].quote.USD.price]),
      ),
    ),
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  );
};
