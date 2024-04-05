import { env } from '$env/dynamic/private';
import { formatUnits } from 'ethers/lib/utils.js';
import { z } from 'zod';
import { redis } from '../redis.js';

const etherscanTokensResponseSchema = z.array(
  z.object({
    TokenAddress: z.string(),
    TokenQuantity: z.string(),
    TokenDivisor: z.string(),
  }),
);

export const GET = async ({ fetch }) => {
  const cached = redis && (await redis.get('explore.tlv-estimate'));

  if (cached) {
    return new Response(cached);
  }

  const etherscanApiKey = env.ETHERSCAN_API_KEY;

  if (!etherscanApiKey) {
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
  }

  const dripsTokenHoldingsRes = await (
    await fetch(
      `https://api.etherscan.io/api?module=account&action=addresstokenbalance&address=0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4&page=1&offset=100&apikey=${etherscanApiKey}`,
    )
  ).json();
  const dripsTokenHoldings = etherscanTokensResponseSchema.parse(dripsTokenHoldingsRes.result);

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
      Number(formatUnits(tokenHoldingRecord.TokenQuantity, tokenHoldingRecord.TokenDivisor)) *
        value;
  }

  await redis?.set('explore.tlv-estimate', total.toString(), {
    EX: 86400,
  });

  return new Response(total.toString());
};
