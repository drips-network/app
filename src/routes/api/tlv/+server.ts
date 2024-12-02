import { env } from '$env/dynamic/private';
import { z } from 'zod';
import { redis } from '../redis.js';
import { formatUnits } from 'ethers';
import network from '$lib/stores/wallet/network.js';

const etherscanTokensResponseSchema = z.array(
  z.object({
    TokenAddress: z.string(),
    TokenQuantity: z.string(),
    TokenDivisor: z.string(),
  }),
);

const CACHE_KEY = `${network.name}-explore.tlv-estimate`;

export const GET = async ({ fetch }) => {
  const cached = redis && (await redis.get(CACHE_KEY));

  if (cached) {
    return new Response(cached);
  }

  const etherscanApiKey = env.ETHERSCAN_API_KEY;

  if (!etherscanApiKey) {
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
  }

  const driptsTokenHoldingRes = await fetch(
    `https://api.etherscan.io/api?module=account&action=addresstokenbalance&address=0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4&page=1&offset=100&apikey=${etherscanApiKey}`,
  );
  if (!driptsTokenHoldingRes.ok) {
    const errorContent = await driptsTokenHoldingRes.text();
    // eslint-disable-next-line no-console
    console.error('Response from etherscan not ok', errorContent);
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
  }
  const dripsTokenHoldingsJson = await driptsTokenHoldingRes.json();

  // eslint-disable-next-line no-console
  console.log('dripsTokenHoldingsRes', dripsTokenHoldingsJson);
  const dripsTokenHoldings = etherscanTokensResponseSchema.parse(dripsTokenHoldingsJson.result);

  const cmcIdMapRes = await (await fetch('/api/fiat-estimates/id-map')).json();
  const cmcIdMap = z.record(z.number()).parse(cmcIdMapRes);

  const relevantCmcIds = Object.fromEntries(
    Object.entries(cmcIdMap).filter(([address]) =>
      dripsTokenHoldings.some((v) => v.TokenAddress.toLowerCase() === address.toLowerCase()),
    ),
  );

  const fiatConversionsRes = await (
    await fetch(`/api/fiat-estimates/price/${Object.values(relevantCmcIds).join(',')}`)
  ).json();
  const fiatConversions = z.record(z.number()).parse(fiatConversionsRes);

  let total = 0;

  for (const [cmcId, value] of Object.entries(fiatConversions)) {
    const tokenAddress = Object.entries(cmcIdMap).find((v) => cmcId === v[1].toString())?.[0];
    if (!tokenAddress) break;

    const tokenHoldingRecord = dripsTokenHoldings.find(
      (v) => v.TokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
    );
    if (!tokenHoldingRecord) break;

    total =
      total +
      Number(
        formatUnits(tokenHoldingRecord.TokenQuantity, Number(tokenHoldingRecord.TokenDivisor)),
      ) *
        value;
  }

  await redis?.set(CACHE_KEY, total.toString(), {
    EX: 86400,
  });

  return new Response(total.toString(), {
    headers: {
      'cache-control': 'public, max-age=3600',
    },
  });
};
