import { z } from 'zod';
import { redis } from '../redis.js';
import { formatUnits } from 'ethers';
import network from '$lib/stores/wallet/network.js';
import { error } from '@sveltejs/kit';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private.js';

const etherscanTokensResponseSchema = z.array(
  z.object({
    TokenAddress: z.string(),
    TokenQuantity: z.string(),
    TokenDivisor: z.string(),
  }),
);

const CACHE_KEY = `${network.name}-explore.tlv-estimate`;

const ETHERSCAN_API_KEY = getOptionalEnvVar(
  'ETHERSCAN_API_KEY',
  true,
  "Drips Contracts TLV won't appear on default explore page.",
);

export const GET = async ({ fetch }) => {
  const cached = redis && (await redis.get(CACHE_KEY));

  if (cached) {
    return new Response(cached);
  }

  if (!ETHERSCAN_API_KEY) {
    return new Response('null', { headers: { 'Content-Type': 'application/json' } });
  }

  const driptsTokenHoldingRes = await fetch(
    `https://api.etherscan.io/api?module=account&action=addresstokenbalance&address=0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4&page=1&offset=100&apikey=${ETHERSCAN_API_KEY}`,
  );
  if (!driptsTokenHoldingRes.ok) {
    const errorContent = await driptsTokenHoldingRes.text();
    const message = `Etherscan returned error response: ${errorContent}`;
    // eslint-disable-next-line no-console
    console.error(message);
    return error(500, message);
  }

  const dripsTokenHoldingsJson = await driptsTokenHoldingRes.json();
  if (dripsTokenHoldingsJson.message === 'NOTOK') {
    const message = `Etherscan returned error message: ${JSON.stringify(dripsTokenHoldingsJson)}`;
    // eslint-disable-next-line no-console
    console.error(message);
    return error(500, message);
  }

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
