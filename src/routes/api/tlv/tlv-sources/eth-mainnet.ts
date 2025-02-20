import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { z } from 'zod';
import type { TLVSourceFn } from '../types';

const ETHERSCAN_API_KEY = getOptionalEnvVar(
  'ETHERSCAN_API_KEY',
  true,
  "Mainnet TLV won't be considered for default explore page.",
);

const etherscanTokensResponseSchema = z.array(
  z.object({
    TokenAddress: z.string(),
    TokenQuantity: z.string(),
    TokenDivisor: z.string(),
  }),
);

const getEthMainnetTlv: TLVSourceFn = async (f) => {
  if (!ETHERSCAN_API_KEY) return [];

  const dripsTokenHoldingRes = await f(
    `https://api.etherscan.io/api?module=account&action=addresstokenbalance&address=0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4&page=1&offset=100&apikey=${ETHERSCAN_API_KEY}`,
  );
  if (!dripsTokenHoldingRes.ok) {
    const errorContent = await dripsTokenHoldingRes.text();
    const message = `Etherscan returned error response: ${errorContent}`;

    throw new Error(message);
  }

  const dripsTokenHoldingsJson = await dripsTokenHoldingRes.json();
  if (dripsTokenHoldingsJson.message === 'NOTOK') {
    const message = `Etherscan returned error message: ${JSON.stringify(dripsTokenHoldingsJson)}`;

    throw new Error(message);
  }

  const dripsTokenHoldings = etherscanTokensResponseSchema
    .parse(dripsTokenHoldingsJson.result)
    .map((v) => ({
      tokenAddress: v.TokenAddress,
      amount: BigInt(v.TokenQuantity),
      decimals: Number(v.TokenDivisor),
    }));

  return dripsTokenHoldings;
};

export default getEthMainnetTlv;
